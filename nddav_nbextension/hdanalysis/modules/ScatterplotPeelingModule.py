from .Module import *

class ScatterplotPeelingModule(Module):

    def __init__(self,parent=None):
        # print "ScatterplotPeelingModule.__init__"

        super(ScatterplotPeelingModule,self).__init__(parent)

        self.makeInputPort("data", HDData)

        self.makeInputPort("function", HDFunction)
        self.makeInputPort("seg", HDSegmentation)
        self.makeInputPort("embedding", HDEmbedding)

        self.makeSharedValue("highlight",int(-1))
        self.makeSharedValue("subselection",np.array([-1],dtype=np.int32))
