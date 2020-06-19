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
                     "RelaxedBSkeleton"]

class Neighborhood(np.ndarray,HDDataObject):
    """A neighborhood is a wrapper for a collection of index pairs representing edges between vertices. Edges cannot be a cycle.
    """
    def __new__(cls, input_array, *args):
        obj = np.asarray(input_array).view(cls)
        HDDataObject.__init__(obj,args)
        obj.normalization = "none"
        return obj

    def __array_finalize__(self, obj):
        if obj is None:
            return
        HDDataObject.__init__(self,obj)

def construct_neighborhood(data, method, max_neighbors=0, beta=1):
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

    edges = ngl.getSymmetricNeighborGraph(method,data,max_neighbors,beta)

    graph = Neighborhood(edges)
    graph.method = method
    graph.normalization = normalizationType
    graph.domain = domain
    
    return graph
