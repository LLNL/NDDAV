from .Module import *
import numpy as np
from scipy.stats.stats import pearsonr

class FuncDistModule(Module):
    def __init__(self, parent=None):
        print ("FuncDistModule.__init__")

        super(FuncDistModule,self).__init__(parent)

        self.makeInputPort("data", HDData)
        self.makeInputPort("function", HDFunction)
        self.makeSharedValue("subselection",np.array([-1],dtype=np.int32))


    def computeDistFromSelection(self, listOfIndex, methodType='correlation'):

        data = self.data.getData()
        f = self.function.getData()

        if data != None:
            rangeNames = list(set(data.names())-set(f.domainNames()))
            rangeSub = dict()

            # print rangeNames
            for name in rangeNames:
                if len(listOfIndex)>1: #if there is subselection
                    rangeSub[name] = data[name][listOfIndex]
                else:
                    rangeSub[name] = data[name]
                #standardization
                rangeSub[name] = rangeSub[name]/max(rangeSub[name])

            # print rangeSub,len(rangeSub)
            dist = np.zeros( (len(rangeSub),len(rangeSub) ))
            for i, keyI in enumerate(rangeSub.keys()):
                for j, keyJ in enumerate(rangeSub.keys()):
                    #compute relation matrix
                    if i>j:
                        continue
                    rangeI = rangeSub[keyI]
                    rangeJ = rangeSub[keyJ]
                    # print keyI, keyJ
                    # print rangeI
                    # print rangeJ
                    # print '\n\n\n'
                    if methodType == 'correlation':
                        val = pearsonr(rangeI,rangeJ)[0]
                        dist[i,j] = val
                        dist[j,i] = val

            return {'matrix':dist.tolist(),'names':rangeSub.keys(), 'distType':methodType}
