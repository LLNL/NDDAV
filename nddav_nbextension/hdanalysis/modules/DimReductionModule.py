from .Module import *
from sklearn.manifold import *
from sklearn.decomposition import *

class DimReductionModule(Module):

    def __init__(self,parent=None):
        super(DimReductionModule,self).__init__(parent)

        self._attributes = []
        self._neighborCount = 7
        self._embeddingDimension = 2
        self._method = "tSNE"
        # self._method = "Spectral"
        self._embedding = None

        self.makeInputPort("function",HDFunction)
        self.makeInputPort("data",HDData)
        # self.makeInputPort("neighborhood",Neighborhood)
        self.makeOutputPort("embedding",HDEmbedding)

        self.link(self.data, self.embedding, self.computeOutput)
        # self.link(self.function, self.embedding, self.computeOutput)

    def computeOutput(self,data):
        print ("DimReductionModule::computeOutput")
        self._embedding = None

        #if len(self._attributes) == 0:
        #    return self.embedding.getData()
        print (self._neighborCount, self._embeddingDimension, self._method)

        if self._method == "LocallyLinear":
            self._embedding = LocallyLinearEmbedding(self._neighborCount,self._embeddingDimension)
        elif self._method == "Isomap":
            self._embedding = Isomap(self._neighborCount,self._embeddingDimension)
        elif self._method == "MDS":
            self._embedding = MDS(self._embeddingDimension)
        elif self._method == "PCA":
            self._embedding = PCA(self._embeddingDimension)
        elif self._method == "tSNE":
            self._embedding = TSNE(n_components=self._embeddingDimension)
        elif self._method == "Spectral":
            self._embedding = SpectralEmbedding(self._embeddingDimension,affinity='rbf')
        elif self._method == "GeoRatio":
            self._embedding = GeoRatioEmbedding(self._embeddingDimension)
        else:
            raise ValueError()

        domain = data.asArray()

        #print domain.shape, domain[:,:-1].shape
        #if self._method != "MDS":
        if isinstance(data, HDFunction):
            embedding = self._embedding.fit_transform(domain[:,:-1])
        elif isinstance(data, HDData):
            embedding = self._embedding.fit_transform(domain)

        #elif self.neighborhood.valid() and self.neighborhood.synced():
        #    weights = np.zeros([data.shape[0],data.shape[0]])
        #    for e in self.neighborhood.getData():
        #        print e
        #        weights[e[0]][e[1]] = sqrt(vdot(data[e[0],:-1] - data[e[1],:-1], data[e[0],:-1] - data[e[1],:-1]))
        #        weights[e[0]][e[1]] =  weights[e[1]][e[0]]
                #print weights
                #embedding = self._embedding.fit_transform(weights)

        names = ["%s_%d" % (self._method,i) for i in range(self._embeddingDimension)]
        types = ['f4']*self._embeddingDimension

        # result = np.zeros(data.shape[0],dtype=zip(names,types)).view(HDData)
        # print zip(names,types), data.shape[0], domain.shape
        # print embedding
        # result = np.zeros(int(data.shape[0]), dtype=zip(names,types)).view(HDEmbedding)
        result = np.zeros(int(data.shape[0]), dtype=zip(names,types))
        result = result.view(HDEmbedding)
        # print result
        result.name = self._makeOutputName(data.name)
        for i in range(0,self._embeddingDimension):
            result['%s_%d' % (self._method,i)] = embedding[:,i]
        result.setMethod(self._method)

        print("Created embedding", result.__class__,result.name)
        # print result
        return result

    def recompute(self):
        if self.data.valid():
            self.embedding.setData(self.computeOutput(self.data.getData()))

    def neighborCount(self, count):
        self._neighborCount = int(count)

    def embeddingDimension(self, dim):
        self._embeddingDimension = int(dim)

    def setMethod(self,method):
        self._method = str(method)

    def _makeOutputName(self,name):
        return "DR_" + name
