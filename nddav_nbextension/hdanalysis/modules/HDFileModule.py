from .Module import *
from hdff import *
from os import path

class HDFileModule(Module):
    def __init__(self, parent=None, file=None):
        super(HDFileModule, self).__init__(parent)
        self.makeOutputPort("EGgraph", ExtremumGraph)
        self.makeOutputPort("data", HDData)

    #### FIXME the current load path is fix on the server ####
    def load(self, filename, isIncludeFunctionIndexInfo=False, cube_dim=2):
        # New is the flag stating whether there is the new hdfile file
        ## convert from unicode to ascii
        filename = str(filename)
        print("##### Load file:", filename, "  ######")
        if path.exists('data/'+filename):
            filename = 'data/'+filename
        collection = DataCollectionHandle()
        collection.attach(filename)
        dataset = collection.dataset(0)
        # load EG
        handle = dataset.getDataBlock(0)
        self._extremum_graph = ExtremumGraph()
        self._extremum_graph.load(handle, isIncludeFunctionIndexInfo, cube_dim)
        self.EGgraph.setData(self._extremum_graph)

    def updateOutputPorts(self):
        self._outputPorts.clear()
        self.makeOutputPort("EGgraph", ExtremumGraph)
        self.makeOutputPort("data", HDData)
        self.EGgraph.setData(self._extremum_graph)

    def insertData(self, handle, isIncludeFunctionIndexInfo=False, cube_dim=2):
        self._extremum_graph = ExtremumGraph()
        self._extremum_graph.load(handle, isIncludeFunctionIndexInfo, cube_dim)
        self.EGgraph.setData(self._extremum_graph)