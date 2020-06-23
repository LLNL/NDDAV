from .Module import *
from sklearn import preprocessing
from scipy import stats, io, linalg
from hdanalysis.external.axisproj import *
from scipy import stats, io, misc
# import pdb

class OptimalAxisAlignModule(Module):

    def __init__(self,parent=None):
        # print "OptimalAxisAlignModule.__init__"
        super(OptimalAxisAlignModule,self).__init__(parent)

        self.makeInputPort("data", HDData)
        self.makeInputPort("function", HDFunction)
        self.makeInputPort("seg", HDSegmentation)
        self.makeOutputPort("projMat", ProjMatrix)
        self.makeOutputPort("normalizedData", DataMatrix)
        #use the HDfunction data (include both the domain and range) for now
        # self.makeSharedValue("highlight",int(-1))
        # self.makeSharedValue("subselection",np.array([-1],dtype=np.int32))

    def setProjMat(self, type, index):
        projM = ProjMatrix()
        # print "setProjMat-", type, index
        if type=="AP":
            projM.setMatrix(self.APlist[index])
            projM.setProjMatrixType("AP")
        elif type == "LP":
            projM.setMatrix(self.LPlist[index])
            projM.setProjMatrixType("LP")

        # print "### ProjMat: \n", projM.getMatrix()
        self.projMat.setData(projM)

    def computeDecomposition(self):
        # embMethod = 'pca'
        embMethod = 'lpp'
        mode = 'unsup' # sup, unsup
        # embMethod = 'lde'
        # mode = 'sup' # sup, unsup

        maxIter = 20
        k = 12
        sigma = 0.3
        nSize = 30
        # nSize = 30
        factor = 1.0
        # preproc = False
        preproc = True

        X = None
        data = self.data.getData().asArray()
        if mode == 'unsup':
            # print data.shape
            X = data.T
            # X = data[:,:-1].T
            labs = None
        elif mode == 'sup':
            X = data[:,:-1].T
            labs = np.ravel(data[:,-1])
            # print np.unique(labs)

        d,N = X.shape
        # print X.shape
        spar = np.minimum(5,int(misc.comb(d,2)/3))
        #compute the multi-views for explanation
        if preproc:
            sc = preprocessing.StandardScaler()
            X = sc.fit_transform(X.T).T

        normData = DataMatrix()
        normData.setMatrix(X)
        self.normalizedData.setData( normData )

        projList = findMultipleLP(X, 2, k, sigma, maxIter, embMethod, labs)
        #orthogoalize projList
        # print projList[0][:,0], '\n', projList[0][:,1]
        dotList = [np.dot(np.transpose(projMat[:,0]),projMat[:,1]) for projMat in projList]
        # print "orthonormal test:\n", dotList
        # projList = [gs(projMat) for projMat in projList]

        LPerrorHist = []
        # print "\nList of linear projections:"
        qualityTrue = np.zeros((N,))
        LPList = [x.T.tolist() for x in projList]
        for i in range(len(projList)):
            emb = projList[i].T.dot(X)
            # print projList[i].T
            # print X
            # print emb.T
            quality = compPR(X,emb,nSize,factor)
            hist = np.histogram(quality,bins=10, range=(0.0,1.0))
            # qualityTrue = np.maximum(qualityTrue,compPR(X,emb,nSize,factor))
            print("LP %d" % (i))
            # print quality
            # print hist[0], hist[1]
            LPerrorHist.append(hist[0].tolist())

            # plt.figure(1)
            # plt.scatter(emb[0,:],emb[1,:],marker='o',color='r',alpha=0.7,s=20,vmin=0,vmax=1)
            # plt.savefig('results/' + dSet + '/decomp_multiple_' + embMethod + '/' + 'lin_emb' + str(i) + '.pdf')
            # plt.show()

        # omegaList, betaList, targetList, targetIDList = findAP(X,projList,spar,k)
        omegaList, betaList, targetList, targetIDList, LP_AP_PRList, LP_AP_EvidList= findAP(X,projList,spar,k)


        # evidList, axisOmegaList = compEvid(omegaList,betaList,targetList,d)
        evidList, axisOmegaList = compEvid_from_LP_AP(LP_AP_EvidList,omegaList)

        # print "evidList:", evidList
        evidList = np.array(evidList)/np.sum(np.array(evidList))
        # print "axisOmegaList", axisOmegaList
        # Print Edges
        # pdb.set_trace()
        axisOmegaList = [x.tolist() for x in axisOmegaList]

        inds = np.argsort(-evidList)
        # print inds
        # print "\n\nList of AAPs and Evidences:"
        quality = np.zeros((N,))
        APerrorHist = []

        self.APlist = []
        APIndexPairList = []
        indexPairList = []
        for it,ind in enumerate(inds):
            omega = axisOmegaList[ind]
            proj = np.zeros((X.shape[0],2))
            proj[omega[0],0] = 1
            proj[omega[1],1] = 1
            self.APlist.append(proj)
            # APIndexPairList.append([omega[0], omega[1]])
            APIndexPairList.append([omega[0], omega[1], evidList[ind]])
            indexPairList.append([omega[0], omega[1]])
            # print proj
            emb = proj.T.dot(X)
            hist = np.histogram(compPR(X,emb,nSize,factor),bins=10, range=(0.0,1.0))
            APerrorHist.append(hist[0].tolist())
            # quality = np.maximum(quality,compPR(X,emb,nSize,factor))
            # plt.figure(1)
            # plt.scatter(emb[0,:],emb[1,:],marker='o',color='r',alpha=0.7,s=20,vmin=0,vmax=1)
            # plt.xlabel('var'+str(omega[0]))
            # plt.ylabel('var'+str(omega[1]))
            # # plt.savefig('results/' + dSet + '/decomp_multiple_' + embMethod + '/' + 'axis_align_emb'+ str(it) +'.pdf')
            # plt.show()
            print ("AAP %d - [%d %d] - Evidence = %f and Quality = %f" % (it, omega[0], omega[1],evidList[ind], np.mean(quality)))

        # betaList =  betaList/np.max(betaList)+0.1
        LP_AP_PRList = LP_AP_PRList/np.max(LP_AP_PRList)
        print ("\nList of edges between LP and AAP:",)
        LP2APmap = []
        for i in range(len(projList)):
            inds = [ii for ii, jj in enumerate(targetIDList) if jj == i]
            # print "\nLP %d:" % (i),
            for j in inds:
                omega = omegaList[j]
                LP2APmap.append([i, indexPairList.index(omega.tolist()), float(LP_AP_PRList[j]) ])
                # print "[%d,%d] %f," % (omega[0], omega[1], LP_AP_PRList[j]),

        #structure
            #list of linear projection
            #list of axis-aligned projection
            # map

        decomposition = {
            "X": X.tolist(),
            "linear": LPList, #[ [[-0.9,0.1],[0.7,0.1]], [[-0.9,0.1],[0.7,0.1]] , [[-0.9,0.1],[0.7,0.1]], [[-0.9,0.1],[0.7,0.1]]],#list of proj matrix
            "axisAligned":APIndexPairList, # [ [0 , 1, 0.9], [1, 2, 0.4], [0,3,0.7], [1,3,0.7], [2,3,0.7], [0,2,0.7], [2,3,0.7]],# dim1, dim2, overallWeight
            "APhist":APerrorHist,
            "LPhist":LPerrorHist,
            "map":LP2APmap #[ [0, 1, 0.2], [0, 0, 0.4], [1, 0, 0.7], [1, 1, 0.1], [1, 2, 0.4], [3, 3, 0.6], [2, 4, 0.2], [1, 5, 0.1], [1, 6, 0.1], [0, 6, 0.1]] #(linearPlotIndex, axisAlignedPlotIndex, contributionWeight )
        }

        # print decomposition["map"]
        #store projection matrix
        self.LPlist = projList;

        # for i in deposition:
        #     print i, deposition[i]

        return decomposition
