from .Module import *
from hdanalysis.external.dynProj import *
from sklearn import manifold

class ViewGraphModule(Module):

    def __init__(self, parent=None):
        # print "ViewGraphModule.__init__"
        super(ViewGraphModule, self).__init__(parent)
        # self.makeInputPort("normalizedData", DataMatrix)
        # self.makeInputPort("projMat", ProjMatrix)

        self.makeInputPort("viewGraph", MatrixList)
        self.makeInputPort("data", HDData)

        self.makeOutputPort("projMat", ProjMatrix)
        self.makeOutputPort("normalizedData", DataMatrix)

        # self.link(self.data, self.viewGraph, self.projMat, self.createViewGraphLayout)


    ############# maintain persistence structure in javascript #########
    def viewGraphLayout(self):
    # def createViewGraphLayout(self, data, viewGraph):
        print ("ViewGraphModule.viewGraphLayout: ", data.__class__)

        normData = DataMatrix()
        X = self.data.getData().asArray()
        # print X.shape
        normData.setMatrix(X.T)
        self.normalizedData.setData( normData )

        ##### Compute distance between views #####
        projMatList = self.viewGraph.getData().getMatrixList()
        similarities = np.zeros((len(projMatList), len(projMatList)))
        for i, mat_i in enumerate(projMatList):
            for j, mat_j in enumerate(projMatList):
                similarities[i,j] = np.linalg.norm( mat_i*mat_j.T + mat_j*mat_i.T )

        ##### layout views #####
        seed = np.random.RandomState(seed=3)
        mds = manifold.MDS(n_components=2, max_iter=300, eps=1e-9, random_state=seed, dissimilarity="precomputed", n_jobs=1)
        pos = mds.fit(similarities).embedding_
        # print pos
        ### return value need to be json compatiable
        return pos.tolist()

    def setCurrentProjMat(self, mat):
        mat = np.matrix(mat)
        projM = ProjMatrix()
        projM.setMatrix(mat)
        projM.setProjMatrixType("LP")

        # print "### ProjMat: \n", projM.getMatrix()
        self.projMat.setData(projM)
