from .SumDataModule import *

class SumParallelCoordinateModule(SumDataModule):

    def __init__(self,parent=None):

        super(SumParallelCoordinateModule,self).__init__(parent)

        self.makeOutputPort('curPC', MultipleHistogram)

        self.makeSharedValue("selectPC", int(1))
        # self.selectPC.changedSignal.connect(self.parallelcoordinatechange)

        self.makeSharedValue("selectExt",int(-1))
        self.selectExt.changedSignal.connect(self.parallelcoordinatechange)

        self.makeSharedValue("highlight",int(-1))
        self.highlight.changedSignal.connect(self.parallelcoordinatehover)

        ## THIS MIGHT BE ADDED LATER FOR INTERACTIVE EXPLORATION FOR Summary parallel coordinates
        self.makeSharedValue("brushedrange",dict)
        self.brushedrange.changedSignal.connect(self.parallelcoordinatechange)

        ## self.brushedrange.changedSignal.connect(self.brushtest)
        # self.makeSharedValue("globalMinMax", np.array([-1], dtype=(np.float32, np.float32)))
        self.makeSharedValue("globalMinMax", dict)


    def parallelcoordinatechange(self, param):

        # print("pc changed ##################")

        # print(self.brushedrange.get())
        alldims = self.sumdata.getData().names()

        cur_ext = self.selectExt.get()

        total_attr = self.selectPC.get()

        outhist = []


        for i in range(total_attr-1):
            if cur_ext != -1:
                hist2d = self.EGgraph.getData().gethists(alldims[i:i+2], cur_ext, cur_brush=self.brushedrange.get())
            else:
                hist2d = self.EGgraph.getData().gethists(alldims[i:i+2], cur_brush=self.brushedrange.get())

            outhist.append(hist2d)

        hist_size = outhist[0].shape[0]

        # Check size to see whether to set data 
        for i in outhist:
            if i.shape[0]!=hist_size:
                return 

        a = np.array(outhist)
        self.curPC.setData(a.view(MultipleHistogram))

        # print("pc finished ##################")

    def parallelcoordinatehover(self, param):

        alldims = self.sumdata.getData().names()

        cur_ext = self.highlight.get()

        if cur_ext == -1 and self.selectExt.get()!=-1:
            cur_ext = self.selectExt.get()

        # if cur_ext != -1:

            # EG = self.EGgraph.getData()

        total_attr = self.selectPC.get()

        outhist = []


        for i in range(total_attr-1):
            if cur_ext != -1:
                hist2d = self.EGgraph.getData().gethists(alldims[i:i+2], cur_ext, cur_brush=self.brushedrange.get())
            else:
                hist2d = self.EGgraph.getData().gethists(alldims[i:i+2], cur_brush=self.brushedrange.get())

            outhist.append(hist2d)

        hist_size = outhist[0].shape[0]

        # Check size to see whether to set data 
        for i in outhist:
            if i.shape[0]!=hist_size:
                return 

        a = np.array(outhist)
        self.curPC.setData(a.view(MultipleHistogram))
