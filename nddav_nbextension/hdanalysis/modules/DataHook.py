from .Module import *
from numpy.lib.recfunctions import merge_arrays
try:
    from hdff import *
except:
    print("can't load hdff")

class DataHook(Module):

    def __init__(self,parent=None):
        #print "FilterModule.__init__"
        super(DataHook,self).__init__(parent)

        self._condition = None
        self._domain = None
        self._range = None
        self._customFunction = None
        self._norm = "none"

        # self.makeInputPort("data",HDData)
        # self.makeInputPort("properties",HDProperties)
        # self.makeInputPort("data",HDData)
        self.makeOutputPort("data",HDData)

        self.makeOutputPort("viewGraphProjMat", MatrixList)
        # self.makeOutputPort("filtered_properties",HDProperties)
        self.makeOutputPort("function",HDFunction)
        self.makeSharedValue("invalidDomain",np.array([-1],dtype=np.uint8))

        ################### shared images ####################
        self.makeSharedValue("images",np.array([-1],dtype=(np.float32, np.float32) ))

        ####### force min max range for each dimension ########
        # self.makeSharedValue("globalMinMax", np.array([-1], dtype=(np.float32, np.float32)))
        self.makeSharedValue("globalMinMax", dict)

    def loadHDFile(self, filename, isIncludeFunctionIndexInfo=False, cube_dim=2):
        # New is the flag stating whether there is the new hdfile file
        ## convert from unicode to ascii
        filename = str(filename)
        print("##### Load file:", filename, "  ######")
        collection = DataCollectionHandle()
        collection.attach(filename)
        dataset = collection.dataset(0)
        # load EG
        handle = dataset.getDataBlock(0)
        self._extremum_graph = ExtremumGraph()
        self._extremum_graph.load(handle, isIncludeFunctionIndexInfo, cube_dim)
        self.EGgraph.setData(self._extremum_graph)

    def loadFile(self, filename):
        # print filename
        data = loadFile(str(filename))
        # data = loadFile("peaks489.csv")
        self.data.setData(data)
        self.setFunction(list(data.dtype.names[0:-1]), data.dtype.names[-1])

    def setInvalidDomain(self, domainLabel):
        self.invalidDomain.set(domainLabel)

    def setViewGraphProjMatrix(self, listOfProjMat):
        matList = MatrixList()
        matList.setMatrixList(listOfMatrix)
        self.viewGraphProjMat.setData(matList)

    def setDataFromArray(self,data):
        N, dim = data.shape
        # print "dim:", dim
        names = ['X%d' % i for i in xrange(0,dim)]
        # print names
        types = ['f4']*dim
        data = data.flatten()
        # print data.shape
        data = data.view(dtype=zip(names,types)).view(HDData)
        data.name = "fromArray"
        # print data
        self.data.setData(data)
        self.setFunction(list(data.dtype.names[0:-1]), data.dtype.names[-1])

    def setImages(self, images):
        self.images.set(images)
        # print self.images.get()

    def setFunction(self,domain,range,norm="stddev"):
        self._domain = domain
        self._range = range
        self._norm = norm

        print("##### before set function #####")
        if self.data.valid():
            print("##### set function #####")
            self.function.setData(self.computeFunction(self.data.getData()))

    def computeFunction(self,data):
        # If we haven't specified a domain
        if self._domain == None or self._range == None:
            # We look for a domain in our parents
            up = self._parent
            while up != None:
                if isinstance(up,FilterModule):
                    if up._domain != None and up._range != None:
                        self._domain = up._domain
                        self._range = up._range
                up = up._parent

        if self._domain != None and self._range != None:
            if self._range == "Custom":
                try:
                    #print "custom = " + self._customFunction
                    exec("custom = " + self._customFunction)
                except:
                    custom = np.zeros(data.shape[0],dtype=[('Custom','f4')])
                func = merge_arrays((data[self._domain], custom), asrecarray=True, flatten=True).copy().view(HDFunction)
                func.normalize(norm=self._norm)
                #print func.dtype.names,func.dtype.names[:-1] + ('Custom',)
                func.dtype.names = func.dtype.names[:-1] + ('Custom',)
                return func
            else:
                return data.function(self._domain+[self._range],norm=self._norm)
        else:
            return None
