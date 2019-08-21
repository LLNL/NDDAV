import numpy as np
import hdtopology as hdt
from .HDFunction import HDFunction
from .HDData import HDData
from .HDDataObject import *


NeighborhoodTypes = ["Ann",
                     "RelativeNeighbor",
                     "Gabriel",
                     "Diamond",
                     "BSkeleton",
                     "RelaxedRelativeNeighbor",
                     "RelaxedGabriel",
                     "RelaxedDiamond",
                     "RelaxedBSkeleton",
                     "Grid"]

class Neighborhood(HDDataObject):
    """A neighborhood encodes a collection of index pairs representing edges
    between vertices. Edges cannot be a cycle.
    """
    def __init__(self,edges=None,t=None,d=None,s=None,length=None):

        super(Neighborhood,self).__init__()

        if edges is not None:
            self.edges = edges
        else:
            self.edges = np.array([[-1,-1]],dtype=np.uint32)

        if t != None:
            self.type = t
        else:
            self.type ="Undefined"

        if length != None:
            self.length = np.array(length,dtype=np.float32)

        self.domain = d
        self.shape = s


    def len(self):
        return self.edges.shape[0]

    def __getitem__(self,i):
        return self.edges[i]

    def __getslice__(self,i,j):
        return self.edges[i:j]

    def __setitem__(self,i,edge):
        self.edges[i] = edge

    def resize(self,length):
        self.edges = np.array(length*[[-1,-1]],dtype=np.uint32)

    def save(self,filename):
        self.edges.tofile(filename)

    def load(self,filename):
        self.edges = np.fromfile(filename,dtype=np.uint32)
        self.edges = self.edges.reshape([self.edges.shape[0]/2,2])

    def loadtxt(self,filename):
        #neigh = extensions.Neighborhood();
        neigh = hdt.Neighborhood();

        size = neigh.load_neighborhood(filename)

        self.edges = np.ndarray(shape=(size,2),dtype=np.uint32)
        for i in xrange(0,size):
            self.edges[i] = [neigh.e(i,0),neigh.e(i,1)]

        if neigh.hasLength():
            self.length = np.zeros(size,dtype=np.float32)
            for i in xrange(0,size):
                self.length[i] = neigh.length(i)

        #self.edges = extensions.load_neighborhood(filename)
        #self.edges = self.edges.reshape([self.edges.shape[0]/2,2])

    def savetxt(self,filename):
        output = open(filename,'w')

        if not hasattr(self,"length") or len(self.length) == 0:
            for e in self.edges:
                output.write("%d %d\n" % (e[0],e[1]))
        else:
            for e,l in zip(self.edges,self.length):
                output.write("%d %d %f\n" % (e[0],e[1],l))

        output.close()

    def outputVTKCells(self,output):

        output.write("\t\t\t<Lines>\n")
        output.write("\t\t\t\t<DataArray type=\"Int32\" Name=\"connectivity\">\n")
        for e in self.edges:
            output.write("%d %d\n" % (e[0],e[1]))
        output.write("\t\t\t\t</DataArray>\n")

        if True:
            output.write("\t\t\t\t<DataArray type=\"Int32\" Name=\"offsets\">\n")
            for i in xrange(0,self.len()):
                output.write("%d\n" % (2*(i+1)));
            output.write("\t\t\t\t</DataArray>\n")

        output.write("\t\t\t</Lines>\n")



def construct_neighborhood(data, method, max_neighbors=0, beta=1):

    #print "function normalization:", data.normalization
    import ngl

    normalizationType = data.normalization
    print ("construct_neighborhood : ", method, max_neighbors, beta, normalizationType)

    if isinstance(data,HDFunction):
        domain = data.dtype.names
        shape = data.shape
        # If this is a function then we want to create the graph
        # based only on the domain
        data = data.asArray()[:,0:-1]
    elif isinstance(data,HDData):
        domain = data.dtype.names[0:-1]
        shape = data.shape
        # Otherwise use all the data
        data = data.asArray()
    else:
        raise ValueError("Expecting HDData or an HDFunction from which to construct a neighborhood")


    # If no neighbors have been specified assume something large
    if max_neighbors == 0:
        max_neighbors = 10*data.shape[1]

    if method == 'Grid':
        edges = construct_grid(data)
    else:
        edges = ngl.getSymmetricNeighborGraph(method,data,max_neighbors,beta)

    graph = Neighborhood(edges,method,domain,shape)
    graph.normalization = normalizationType
    return graph


def construct_grid(data):

    dim = data.shape[1]

    # First let's try to find out the spaceing
    delta = [1e35]*dim
    low  = [data[:,k].min() for k in xrange(0,dim)]
    high = [data[:,k].max() for k in xrange(0,dim)]

    for i in xrange(0,data.shape[0]-1):
        for k in xrange(0,dim):
            if data[i][k] != data[i+1][k]:
                delta[k] = min(delta[k],abs(data[i][k] - data[i+1][k]))

    res = [int((high[k] - low[k])/delta[k]+1.25) for k in xrange(0,dim)]

    print ("Grid spacing ", delta,low,high,res)

    flag = np.zeros(shape=res,dtype=np.uint8)
    indices = np.zeros(shape=res,dtype=np.uint32)

    for j,d in enumerate(data):
        #print k,d
        #i = [0,0,0,0,0]
        i = tuple([int((d[k] - low[k])/delta[k] + 0.5) for k in xrange(0,dim)])
        #print i,j
        flag[i] = 1
        indices[i] = j


    edges = []
    p = [0]*dim
    while True:

        q = list(p);
        for k in xrange(0,dim):
            q[k] += 1
            if p[k] < res[k]-1 and flag[tuple(p)] == 1 and flag[tuple(q)] == 1:
                edges += [[indices[tuple(p)],indices[tuple(q)]]]
                edges += [[indices[tuple(q)],indices[tuple(p)]]]
            q[k] -= 1

        #if flag[tuple(p)] == 0:
        #print "Missing Point ", p

        p[0] += 1
        for k in xrange(0,dim-1):
            if p[k] == res[k]:
                p[k] = 0
                p[k+1] += 1

        if p[-1] == res[-1]:
            break

    return np.array(edges,dtype=np.uint32)
