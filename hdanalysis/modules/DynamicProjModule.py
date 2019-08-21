from .Module import *
from hdanalysis.external.dynProj import *

class DynamicProjModule(Module):

    def __init__(self, parent=None):
        print ("DynamicProjModule.__init__")
        super(DynamicProjModule, self).__init__(parent)
        self.makeInputPort("normalizedData", DataMatrix)
        self.makeInputPort("projMat", ProjMatrix)
        self.makeInputPort("data", HDData)

    def computeDynamicProj(self, source, target):
        source = np.array(source).astype(np.double)
        target = np.array(target).astype(np.double)
        # print source
        # print target
        # source = normalizeBasis(orthnogoalize(source))
        # target = normalizeBasis(orthnogoalize(target))
        # projMatList = generateDynamicProjPathGGobi(source, target)
        # projMatList = generateDynamicProjPath(source, target)
        projMatList = generateFullDynamicProjPath(source, target)
        return [x.tolist() for x in projMatList]
