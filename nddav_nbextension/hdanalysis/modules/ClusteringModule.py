from .Module import *
from sklearn.cluster import *

class ClusteringModule(Module):

    def __init__(self,parent=None):
        super(ClusteringModule,self).__init__(parent)
        self._maxIter = 500
        self._numClusters = 5
        self._method = "KMeans"
        self.makeInputPort("data", HDFunction)
        self.makeInputPort("embedding", HDEmbedding)
        self.makeOutputPort("seg", HDSegmentation)
        self.link(self.data,self.seg,self.computeOutput)

    def computeOutput(self,data):
        data = data.asArray()

        print("method",self._method," num ",self._numClusters)

        if self._method == "DBSCAN":
            clustering = DBSCAN().fit_predict(data[:,:-1])

        elif self._method == "KMeans":
            clustering = KMeans(int(self._numClusters),max_iter=self._maxIter).fit_predict(data[:,:-1])

        elif self._method == "MeanShift":
            clustering = MeanShift().fit_predict(data[:,:-1])

        elif self._method == "Spectral":
            temp = data[:,:-1].astype(np.float)
            clustering = SpectralClustering(int(self._numClusters),affinity='rbf').fit_predict(temp)
        else:
            raise ValueError()

        result = np.zeros(data.shape[0],dtype=[("cluster-id",'i4')]).view(HDSegmentation)
        result["cluster-id"] = clustering
        result.setMethod(self._method)
        return result

    def recompute(self):
        if self.data.valid():
            self.seg.setData(self.computeOutput(self.data.getData()))

    def clusterCount(self, count):
        self._numClusters = count

    def setMethod(self,method):
        self._method = method

    def getModuleInfoDict(self):
        return {"method": self._method,
                "clusterNum": self._numClusters,
                "methods": ["DBSCAN", "KMeans", "MeanShift", "Spectral"]
                }
