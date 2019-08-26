from .Module import *
from hdanalysis.core import *
import numpy as np
import json

class TopospineModule(Module):
    def __init__(self, parent=None):
        super(TopospineModule, self).__init__(parent)
        self.makeInputPort("EGgraph", ExtremumGraph)
        # self.makeOutputPort("EGgraph", ExtremumGraph)
        self.EGgraph.changedSignal.connect(self.initTopoSpine)
        ### FIXME add this to access variable names
        self.makeInputPort("function", HDFunction)

        self.makeSharedValue("segCount",int(1))
        self.segCount.changedSignal.connect(self.graphChanged)
        self.makeSharedValue("variation",float(10e34))
        self.variation.changedSignal.connect(self.graphChanged)


        self.makeSharedValue("selectExt",int(-1))
        self.makeSharedValue("subselection", np.array([-1],dtype=np.int32))

        self.makeSharedValue("highlight",int(-1))
        # self.highlight.changedSignal.connect(self.)

        self.makeSharedValue("brushedrange",dict)
        # This was done by cb on js side
        # self.brushedrange.changedSignal.connect(self.brushtest)

    def initTopoSpine(self, EGgraph):
        print ("######### TopospineModule::initTopoSpine ########")
        self._extremum_graph = EGgraph

        #### FIXME remove the need for Function #####
        # function = self.function.getData()
        # rangeNames = function.rangeNames()
        try:
            ###### when compute topology on-the-fly ######
            function = self.function.getData()
            rangeNames = function.rangeNames()
            domainNames = function.domainNames()
            print(function, rangeNames, domainNames)
            if function:
                self._topoSpines = TopoSpines(self._extremum_graph, rangeNames, domainNames)
        except:
            ###### when load precomputed hdff file ######
            print("load precomputed hdff file")
            attrs = self._extremum_graph.getAttrs()
            print(attrs)
            self._topoSpines = TopoSpines(self._extremum_graph, [attrs[-1]], attrs[:-1])

    # Somewhere here selection was set to -1
    def computeTopoSpineJSON(self, variation, persistence, scale, layoutType='graph', contourCount = 10):
        # print ("Overall is computed ")
        self.currentVariation = variation
        self.currentPersistence = persistence
        self.currentLayoutType = layoutType
        self.scale = scale#80#scale

        # sel = self.subselection.get()
        # sel = self.selectExt.get()
        # print("current sel = ", sel, ' subselection = ', self.subselection.get())

        self._topoSpines.update(
                                self._extremum_graph.getGraph(var=variation, per=persistence),
                                self._extremum_graph.getEGMin(),
                                self._extremum_graph.getEGMax(),
                                # self._extremum_graph.getSeg(var=variation, per=persistence)
                                )

        spineData = None

        if self.selectExt.get()!=-1:#len(self.subselection.get()) > 1:
            # print("generate topospine with greater subselection\n")
            spineData = self._topoSpines.generateOverlapColoringSpineJSON(contourCount,
                                    self.subselection.get(),
                                    var=self.currentVariation,
                                    per=self.currentPersistence,
                                    layoutType=self.currentLayoutType,
                                    scale=self.scale)
        # elif len(self.brushedrange.get())>0:
        #     print("------------ brushrange ------------\n")
        #     # print(self.brushedrange.get())
        #     spineData = self._topoSpines.jsonSpine(contourCount,
        #                 var=variation,
        #                 per=persistence,
        #                 layoutType=layoutType,
        #                 scale=scale)

        else:
            # print("------------ generate topoSpine ------------\n")
            # print(self.brushedrange.get())
            spineData = self._topoSpines.jsonSpine(contourCount,
                                    var=variation,
                                    per=persistence,
                                    layoutType=layoutType,
                                    scale=scale)

        spine = spineData.replace('\n','')

        return spine

    def computeSelectionSpineJSON(self):
        # Brushing effect will be added here

        # print("Selection is computed ")

        # NEED TO add range selection here

        # brushedrange = self.brushedrange.get()

        # assume the data is already set, since this can only be activated if existing spine is drawn
        # print("selectExt = ", self.selectExt.get(), " subselection = ", self.subselection.get(), ' brushed = ', self.brushedrange.get())
        # print(self.subselection.get())

        if self.selectExt.get()!=-1 or self.brushedrange.get()!={}:
            # print("OVERLAP")

            # Do something here to convert brushedrange to a list of probabilities
            selected_f = self._extremum_graph.getselectedfunction(self.brushedrange.get(), self.selectExt.get())
            original_f = self._extremum_graph.getfuncHist(self.brushedrange.get(),self.selectExt.get())

            # if selected_f.shape[0]>128:
            #     print(selected_f.reshape((128,128)))
            # print(np.sum(selected_f), np.sum(original_f))

            # print(selected_f, original_f)
            # print(selected_f.shape)
            spineData = self._topoSpines.generateOverlapColoringSpineJSON(10,
                            self.subselection.get(),#[self.selectExt.get()],
                            var=self.currentVariation,
                            per=self.currentPersistence,
                            layoutType=self.currentLayoutType,
                            scale=self.scale,
                            ##brushedrange=self.brushedrange.get()
                            brushed = selected_f,
                            original = original_f
                            )
        else:
            spineData = self._topoSpines.jsonSpine(10,
                        var=self.currentVariation,
                        per=self.currentPersistence,
                        layoutType=self.currentLayoutType,
                        scale=self.scale)
            # spineData = self._topoSpines.generateOverlapColoringSpineJSON(10,
            #                             self.subselection.get(),
            #                             var=self.currentVariation,
            #                             per=self.currentPersistence,
            #                             layoutType=self.currentLayoutType,
            #                             scale=self.scale,
            #                             brushedrange=self.brushedrange.get()
            #                             )

        spine = spineData.replace('\n','')

        return spine

    def subselectSegmentByExtremaIndex(self, index):

        seg = self._extremum_graph.segmentation(var=self.currentVariation,
                                                per=self.currentPersistence)

        cur_seg = seg[index]
        # print (seg.keys(), index)

        cur_index = self.selectExt.get()
        self.selectExt.set(cur_index)

        # print(cur_seg)
        print("cur_index", cur_index, "new_index", cur_seg[0])
        # print("Select!!!!!!!!!!!!!", "new index: ", index, " previous ind: ", cur_index, "seg0", cur_seg)

        ### NEED TO CHANGE HERE TO MAKE IT WORK FOR NON HISTOGRAM CASE
        if len(cur_seg)==len(set(cur_seg)): #Non Histogram Case
           self.subselection.set(np.array(cur_seg))
        else:  #### histogram case
            if cur_index!=cur_seg[0]:

                # not colored
                self.selectExt.set(int(cur_seg[0]))
                self.subselection.set(np.array([cur_seg[0], np.sum(np.array(cur_seg))-cur_seg[0]]))
                # print("After Updating Index, selectExt = ", self.selectExt.get(), " subselection = ", self.subselection.get())
            else:
                # print("Restore Index")
                self.subselection.set(np.array([-1]))
                self.selectExt.set(-1)

    # Only highlight extrema
    def subselectExtrema(self, index):
        # print("HIGHLIGHT", "new index: ", index, " previous ind: ", self.selectExt.get())
        # print("subselectExtrema here with index = ", index)

        self.highlight.set(index)
        if index == -1 and self.selectExt.get() == -1:
            # self.subselection.set(np.array([index]))
            self.selectExt.set(-1)

    def setSegCount(self,count):
        self.segCount.set(int(count))

    def setVariation(self,var):
        self.variation.set(float(var))

    def graphChanged(self,parameter):
        ''' when persistence or variation changes the extrema graph will also
            change, which leads to a redraw of topoSpine
        '''
        self.graph.setData(self._extremum_graph.getConnectivity(count=self.segCount.get(),var=self.variation.get()))

    # def brushtest(self, parameter):

    #     print("----------------- brushtest ------------------")
    #     print(parameter)
