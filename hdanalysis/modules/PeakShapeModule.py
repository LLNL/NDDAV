from .Module import *
import numpy as np
from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.neighbors import KNeighborsRegressor
from sklearn.gaussian_process.kernels import RBF, ConstantKernel as C

'''
Using 1D slab to visualize the shape of the function near the local peaks

for a 1D slice,
    - specify the focus point
    - specify the dimension

'''

class PeakShapeModule(Module):

    def __init__(self, parent=None):
        super(PeakShapeModule, self).__init__(parent)
        self.makeInputPort("data", HDData)
        self.makeInputPort("function", HDFunction)
        # self.makeInputPort("seg", HDSegmentation)
        self.makeSharedValue("highlight",int(-1))
        self.makeSharedValue("subselection",np.array([-1],dtype=np.int32))

        self.continuousModel = None

    def generateMultipleNearbyLines(self, point, dir):
        pass
        #perturb point to generate multiple line alone the same direction

    def predictionTest(self, point):
        pointTrueValue = point[-1]
        point = np.array(point[:-1])
        pointPredictValue = self.continuousModel.predict(point.reshape(1, -1))
        # print "true value:", pointTrueValue, "   predict value:", pointPredictValue
        # print "\n"

    def updateFocusPoint(self, index, focusDimIndex, slabSize):
        data = self.function.getData().asArray()
        rangeNames = list(set(self.data.getData().names())
                    - set(self.function.getData().domainNames()))
        domainNames = list(self.function.getData().domainNames())

        focusPoint = data[index,:]

        if self.continuousModel == None:
            #build model from samples

            X = data[:,:-1]
            y = data[:,-1].reshape(-1, 1)
            # y = np.reshape(y, (len(y),1))
            # print y
            # print "X", X.shape
            # print "y", y.shape

            # kernel = RBF(10, (1e-2, 1e2))
            self.continuousModel = GaussianProcessRegressor(n_restarts_optimizer=2)
            # self.continuousModel = GaussianProcessRegressor()
            # self.continuousModel = KNeighborsRegressor(n_neighbors=4)
            # self.continuousModel = RandomForestRegressor(max_depth=10, random_state=0)
            self.continuousModel.fit(X, y)
        #point containing value of different dimensions
        # print "\nFinish model training:"
        # self.predictionTest(data[100])
        # self.predictionTest(data[200])
        # self.predictionTest(data[458])
        # self.predictionTest(data[450])

        ################ add other sampling lines ##################
        point = np.array(focusPoint[:-1])
        domain = data[:, :-1] #remove the function value
        domainDim = domain.shape[1]
        perturbRatio = slabSize;
        dmax = np.amax(domain, axis=0)
        dmin = np.amin(domain, axis=0)
        # print "dmax:", dmax, "   dmin:", dmin
        perturbRange = (dmax-dmin)*perturbRatio
        # print "perturbRange:", perturbRange

        #sampling region ratio 0.1
        sampleCount = 150
        perturbSamples = []
        perturbSamples.append(point)
        for i in range(sampleCount):
            randomOffset = np.random.random_sample(domainDim)
            randomSample = point + randomOffset*(2*perturbRange) - perturbRange
            # print "randomSample:",randomSample
            perturbSamples.append(randomSample)

        u = np.zeros(domainDim)
        u[focusDimIndex] = 1.0

        p = np.array(perturbSamples)-point
        p_proj = np.dot(p, u)
        # print "p_proj^2", p_proj*p_proj
        p = np.linalg.norm(p, axis=1)
        # print "p.shape", p.shape
        dist = np.sqrt(p*p-p_proj*p_proj)
        dist = dist/np.max(dist)
        # np.insert(dist, 0, 0.0)
        # print "dist:", dist

        #sample point near the focus point
        # print self.continuousModel.predict(point[:-1])

        rmax = np.max(data[:, focusDimIndex])
        rmin = np.min(data[:, focusDimIndex])

        #generate sample pattern along the line
        domainLineSample = np.arange(rmin, rmax, (rmax-rmin)/200.0)

        funcLineSample = []

        slabInfo = dict()
        slabInfo['type'] = "continuous"

        for sample in perturbSamples:

            query = np.tile(sample, (len(domainLineSample),1))
            query[:, focusDimIndex] = domainLineSample
            predictions = self.continuousModel.predict(query)
            # print "predictions:", predictions
            funcLineSample.append(predictions.flatten().tolist())

        # slabInfo['dist'] = dist.tolist()
        slabInfo['rangeNames'] = rangeNames
        slabInfo['domainNames'] = domainNames
        # slabInfo['focusIndex'] = index

        slabInfo['domainLine'] = domainLineSample.tolist()
        slabInfo['fLines'] = funcLineSample
        slabInfo['dist'] = dist.tolist()
        slabInfo['focusIndex'] = index
        slabInfo['focusPoint'] = focusPoint.tolist()
        # self.currentLineDist = dist
        return slabInfo


    def computeSegmentShape(self, index):
        #compute the plot of function value vs. distance from the extrema
        segments = self.subselection.get()
        data = self.function.getData().asArray()
        rangeNames = list(set(self.data.getData().names())
                    - set(self.function.getData().domainNames()))
        domainNames = list(self.function.getData().domainNames())
        focusPoint = data[index,:]
        domain = data[:, :-1] #remove the function value
        dist = []
        for index in segments:
            dist.append(float(np.linalg.norm(domain[index,:]-focusPoint[:-1])))

        slabInfo = dict()
        slabInfo['type'] = "segmentShape"
        slabInfo['rangeNames'] = rangeNames
        slabInfo['domainNames'] = domainNames
        # slabInfo['focusIndex'] = index

        segments = [int(v) for v in segments]
        # print "Segmetns:", np.array(segments).tolist()
        # print dist
        slabInfo['dist'] = dist
        slabInfo['focusIndex'] = int(index)
        slabInfo['focusPoint'] = focusPoint.tolist()
        slabInfo['segments'] = segments
        # print slabInfo
        return slabInfo


    def updateFocusIndex(self, index, focusDimIndex):
        data = self.function.getData().asArray()
        domain = data[:, :-1] #remove the function value
        rangeNames = list(set(self.data.getData().names())
            - set(self.function.getData().domainNames()))
        domainNames = list(self.function.getData().domainNames())
        print "domainNames:", domainNames
        print "rangeNames:", rangeNames
        # domain = self.data.getData().function(domainNames)

        domainFocus = domain[index,:]
        print "domainFocus:", domainFocus
        print "domain.shape", domain.shape

        #compute distance from a point to the line
        u = np.zeros(domain.shape[1])
        u[focusDimIndex] = 1.0
        p = domain-domainFocus
        p_proj = np.dot(p, u)
        # print "p_proj^2", p_proj*p_proj
        p = np.linalg.norm(p, axis=1)
        # print "p.shape", p.shape
        dist = np.sqrt(p*p-p_proj*p_proj)
        dist = dist/np.max(dist)

        # print "dist:", dist

        slabInfo = dict()
        slabInfo['type'] = "discrete"
        slabInfo['dist'] = dist.tolist()
        slabInfo['rangeNames'] = rangeNames
        slabInfo['domainNames'] = domainNames
        slabInfo['focusIndex'] = index
        self.currentLineDist = dist
        return slabInfo

    # fit a regression line to approximate the shape based on the
    # the slabSize
    def computeApproximateShape(self, slabSize):
        ind = np.where(self.currentLineDist < slabSize)
        # pass

        #measure distance to the line in the domain
        #(1D slice of point)
