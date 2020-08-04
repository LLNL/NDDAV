from .SumDataModule import *

class SumScatterPlotModule(SumDataModule):

    def __init__(self,parent=None):

        super(SumScatterPlotModule,self).__init__(parent)

        self.makeOutputPort('curSP', SingleHistogram)

        self.makeSharedValue("selectSP", np.array([0,1],dtype=np.int32))
        self.selectSP.changedSignal.connect(self.scatterplotchange)

        self.makeSharedValue("selectExt",int(-1))
        self.selectExt.changedSignal.connect(self.scatterplotchange)

        self.makeSharedValue("highlight",int(-1))
        self.highlight.changedSignal.connect(self.scatterplothover)

        self.makeSharedValue("brushedrange",dict)
        self.brushedrange.changedSignal.connect(self.scatterplotchange)

        # link is not working since sumdata is a parent module for current module

        # self.link(self.EGgraph, self.curSP, self.getsp)
        #
        # def getsp(self, EGgraph, sumseg):
        #     for ext in sumseg:
        #         hist1d = EGgraph.get1Dhist(ext, 0)
        #
        #         hist2d = EGgraph.get2Dhist(ext, 0, 3)
        #
        #     a = np.array(hist2d)
        #     return a.view(SingleHistogram)
        
        ## self.makeSharedValue("globalMinMax", np.array([-1], dtype=(np.float32, np.float32)))
        self.makeSharedValue("globalMinMax", dict)

    def scatterplotchange(self, param):

        # print("SC Change ############################## param: ", param)
        alldims = self.sumdata.getData().names()

        cur_ext = self.selectExt.get()

        
            # print "SP CHANGE"
            # EG = self.EGgraph.getData()

        cur_attr = self.selectSP.get()

        # Reverse Might
        #if cur_attr[0] == cur_attr[1]:
        #    return 
        
        if cur_ext != -1:
            hist2d = self.EGgraph.getData().gethists([alldims[cur_attr[0]], alldims[cur_attr[1]]], cur_ext, cur_brush=self.brushedrange.get())

        else:
            hist2d = self.EGgraph.getData().gethists([alldims[cur_attr[0]], alldims[cur_attr[1]]], cur_brush=self.brushedrange.get())

        # if len(hist2d) == 1:
        #     hist2d = EG.get2Dhist(alldims[cur_attr[1]], alldims[cur_attr[0]],cur_ext)

        a = np.array(hist2d)
        self.curSP.setData(a.view(SingleHistogram))

        # print("SC Finished ############################## param: ", param)

    def scatterplothover(self, param):

        # print("############################## param: ", param)
        alldims = self.sumdata.getData().names()

        cur_ext = self.highlight.get()

        if cur_ext == -1 and self.selectExt.get()!=-1:
            cur_ext = self.selectExt.get()

        

        cur_attr = self.selectSP.get()

        # Reverse Might
        # print(alldims[cur_attr[0]], alldims[cur_attr[1]], cur_ext)
        if cur_ext != -1:
            hist2d = self.EGgraph.getData().gethists([alldims[cur_attr[0]], alldims[cur_attr[1]]], cur_ext, cur_brush=self.brushedrange.get())

        else:
            hist2d = self.EGgraph.getData().gethists([alldims[cur_attr[0]], alldims[cur_attr[1]]], cur_brush=self.brushedrange.get())
        # if len(hist2d) == 1:
        #     hist2d = EG.get2Dhist(alldims[cur_attr[1]], alldims[cur_attr[0]],cur_ext)

        a = np.array(hist2d)
        self.curSP.setData(a.view(SingleHistogram))
