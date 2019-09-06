from .Module import *
from hdanalysis.core import *
import numpy as np
import json

class EGModule(Module):
    '''
    The EGModule responable for computing morse complex and generating an extrema graph
    '''

    def __init__(self,parent=None):
        super(EGModule,self).__init__(parent)

        self.makeInputPort("function",HDFunction)
        self.makeInputPort("neighborhood",Neighborhood)

        self.makeOutputPort("EGgraph", ExtremumGraph)
        self.makeSharedValue("invalidDomain",np.array([0],dtype=np.uint8))

        # for compute topology
        self._extremum_graph = ExtremumGraph()
        self._slope = AscendingEuclidian()
        # self._slope = DescendingEuclidian()

        self.link(self.function,self.neighborhood,self.EGgraph, self.computeExtremumGraph)

    def setSlope(self,slope):
        if type(self._slope) != type(slope):
            self._slope = slope
            self.function.changedSignal.emit(self.function.getData(),self.function.version)

    def computeExtremumGraph(self,function,neighborhood):

        if self._slope.__class__ == AscendingEuclidian().__class__:
            self._extremum_graph.initialize(function, neighborhood,self._slope, self.invalidDomain.get())
        elif self._slope.__class__ == DescendingEuclidian().__class__:
            self._extremum_graph.initialize(function, neighborhood,self._slope, self.invalidDomain.get())
        else:
            raise ValueError("This slope is not implemented in a fast way")

        return self._extremum_graph
