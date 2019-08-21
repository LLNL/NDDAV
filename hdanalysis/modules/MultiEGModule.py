from . import EGModule
from hdanalysis.core import *
# import numpy as np

class MultiEGModule(EGModule):

    def __init__(self,parent=None):
        super(MultiEGModule,self).__init__(parent)
        self.makeOutputPort("EGgraphCompare", ExtremumGraphCmp)
        self._compare_extremum_graph = ExtremumGraphCmp()

    def updateCmpFunction(self, dimensionName):
        self.cmpDimName = dimensionName
        #select
        if self.data:
            domainNames = list(self.function.getData().dtype.names[:-1])
            # print domainNames, dimensionName
            self.cmpFunction = self.data.getData().function(domainNames+[dimensionName])
            #compute topology
            if self._slope.__class__ == AscendingEuclidian().__class__:
                self._compare_extremum_graph.initialize(self.cmpFunction,self.neighborhood.getData(),self._slope)
            elif self._slope.__class__ == DescendingEuclidian().__class__:
                self._compare_extremum_graph.initialize(self.cmpFunction,self.neighborhood.getData(),self._slope)
            else:
                raise ValueError("This slope is not implemented in a fast way")

            print ("finished comparison extremumGraph initialization")
            # self._compare_extremum_graph.segmentation(count=self.segCount.get())
            # update the comparison extrema graph
            self._topoSpines.setCmpEG(self.cmpFunction, self._compare_extremum_graph)

            self.EGgraphCompare.setData(self._compare_extremum_graph)

            print ("finished comparison extremumGraph computation")

    def computeCmpSpineJSON(self, variation, persistence):
        self.cmpSpineVariation = variation
        self.cmpSpinePersistence = persistence

        spineData = self._topoSpines.computeCmpSpineJSON(
                                var=variation,
                                per=persistence)
        if spineData:
            spine = spineData.replace('\n','')
            return spine
