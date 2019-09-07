from .Module import *
from hdanalysis.core import *
from math import sqrt
import pdb

class NeighborhoodModule(Module):

    _defaultMethod = 6

    def __init__(self,parent=None,neigh=None):
        Module.__init__(self,parent)

        self.makeInputPort("function",HDFunction)
        self.makeOutputPort("neighborhood",Neighborhood)
        # print self.neighborhood.dataType

        self.isCustomized = False

        if neigh is not None:
            self.isCustomized = True
            if isinstance(neigh, basestring):
                ## load neighborhood
                neighObj = Neighborhood()
                neighObj.load(neigh)
                # print "\nSet Neighborhood", self.neighborhood.getVersion()
                # print "\n"
                self.neighborhood.setData(neighObj)
                # self.neighborhood._setData(neighObj,0)
            elif isinstance(neigh, Neighborhood):
                self.neighborhood.setData(neigh)
                # self.neighborhood._setData(neigh,0)

        self._method = NeighborhoodTypes[NeighborhoodModule._defaultMethod]
        self._maxNeighbors = 20
        self._beta = 1 / sqrt(2)

        self.link(self.function,self.neighborhood,self.computeNeighborhood)

    ###### define how the module should be update given
    # def update(self):
    #     self.neighborhood.setData(self.computeNeighborhood(self.function.getData()))

    def saveGraph(self, filename):
        self.neighborhood.getData().save(filename)

    def computeNeighborhood(self,function):
        if (self.neighborhood.valid()
            and self.neighborhood.getData().domain == function.domain().dtype.names
            #and self.neighborhood.getData().shape == function.shape
            and self.neighborhood.getData().normalization == function.normalization):
             return
        if self.isCustomized:
            return

        print ("\n============ computeNeighborhood(self,function): ============\n")
        graph = construct_neighborhood(function,str(self._method),self._maxNeighbors,self._beta)
        return graph


    def method(self,name):
        if name not in NeighborhoodTypes:
            raise ValueError("Neighborhood type \"%s\" not recognized" % name)
        self._method = name


    def maxNeighbors(self,k):
        self._maxNeighbors = k

    def beta(self,_beta):
        if _beta == "":
            _beta = "0.0"
        self._beta = float(_beta)

    def recompute(self):
        if self.function.valid():
            #self.neighborhood._setData(self.computeNeighborhood(self.function.getData()), self.neighborhood.version+1)
            graph = self.computeNeighborhood(self.function.getData())
            #pdb.set_trace()
            self.neighborhood.setData(graph)

    def dumpVTP(self):
        if self.function.valid() and self.neighborhood.valid:
            outputVTKGraph("graph.vtp",self.function.getData(),self.neighborhood.getData())



    ########## interface for javascript calls ###########

    def getModuleInfoDict(self):
        methodList = ['Ann',
                 'RelativeNeighbor',
                 'Gabriel',
                 'Diamond',
                 'BSkeleton',
                 'RelaxedRelativeNeighbor',
                 'RelaxedGabriel',
                 'RelaxedDiamond',
                 'RelaxedBSkeleton',
                 'Grid']

        return {
                   "methods"     : methodList,
                   "method"      : self._method,
                   "maxNeighbor" : self._maxNeighbors,
                   "beta"        : self._beta
                }

    def computeNeighborhoodByParams(self, method, maxNeighbor, beta):
        self.method(method)
        self.maxNeighbors(int(maxNeighbor))
        self.beta(beta)

        self.recompute()
