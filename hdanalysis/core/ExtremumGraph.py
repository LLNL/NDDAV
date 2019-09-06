import numpy as np
import json
from scipy import linalg
import hdtopology as hdt

from .Slope import *
from .HDDataObject import *
from .HDWarning import *
from .Segmentation import *
from .ExtremaConnectivity import *

from hdanalysis.core.HDDataObject import HDDataObject

class ExtremumGraph(HDDataObject):
    """An ExtremumGraph represents all extrema and saddles of a function in an
    hierarchical manner as described in the TopologicalSpines paper. It
    contains a (hierarchical) list of segments, extrema and saddles along
    with both persistence and variation thresholds to construct the spines
    """

    def __init__(self):
        # added by shusen
        HDDataObject.__init__(self)

        self._eg = hdt.ExtremumGraphExt()

    def load(self, handle, isIncludeFunctionIndexInfo, cube_dim):
        self._eg.load(handle, isIncludeFunctionIndexInfo, cube_dim)

    def initialize(self,function,edges,slope,flag_array=np.array([0],dtype=np.uint8)):

        if isinstance(slope,AscendingEuclidian):
            self._eg.initialize(function,flag_array,edges,True,10,2)
        elif isinstance(slope,DescendingEuclidian):
            self._eg.initialize(function,flag_array,edges,False,10,2)

    def criticalPointF(self, index):
        return self._eg.criticalPointFunctionValue(index)

    def segmentation(self,**kwords):

        if 'per' in kwords:
            count = self._eg.countForPersistence(kwords['per'])

        elif 'count' in kwords:
            count = kwords['count']

        segs = self._eg.segmentation(count)

        segments = Segmentation()
        for s in segs:
            segments += Segment(s)

        return segments

    def criticalPointLocation(self, ext):
        # return self._eg.criticalPointLocation(ext)
        return self._eg.criticalPointLocation(ext)


    def gethists(self, attrs, ext=None, cur_brush={}):
        # print("attrs = ", attrs," Cur_brush = ", cur_brush)

        dims = []
        ranges = []
        for i in cur_brush:
            # ii = i.encode('utf-8')
            dims.append(i)
            ranges.append(cur_brush[i])

        all_attrs = self.getAttrs()
        # Reverse order issue
        if len(attrs)==2 and  all_attrs.index(attrs[0])>all_attrs.index(attrs[1]):
            attrs = attrs[::-1]
        if len(attrs)==2 and  all_attrs.index(attrs[0])==all_attrs.index(attrs[1]):
            attrs = [attrs[0]]

        # print("dims = ", dims)

        if ext and ext>=0:
            if len(dims)==0:
                # print(dims)
                return self._eg.getHist(ext, 10, attrs, False)
            else:
                # print(dims)
                return self._eg.getHist(ext, 10, attrs, False, dims, ranges)
        else:
            if len(dims)==0:
                # print(dims)
                return self._eg.getHist(attrs, False)
            else:
                # print(attrs, dims, ranges)
                return self._eg.getHist(attrs, False, dims, ranges)

    def getAttrs(self):

        return self._eg.getJoint().getAttr()

    def getRange(self, attr):

        # print("attr: ", attr)
        return self._eg.getJoint().get(attr).ranges()

    def segment(self,ext,threshold,**kwords):

        if 'per' in kwords:
            count = int(self._eg.countForPersistence(kwords['per']))
        elif 'count' in kwords:
            count = kwords['count']

        return self._eg.segment(int(ext),int(count),float(threshold))

    def coreSegment(self,ext,**kwords):

        if 'per' in kwords:
            count = int(self._eg.countForPersistence(float(kwords['per'])))
        elif 'count' in kwords:
            count = kwords['count']

        return self._eg.coreSegment(ext,count)

    def highestSaddleForExtremum(self,ext,**kwords):

        if 'per' in kwords:
            count = self._eg.countForPersistence(kwords['per'])
        elif 'count' in kwords:
            count = kwords['count']

        return self._eg.highestSaddleForExtremum(ext,count)

    def segmentSize(self,ext,threshold,**kwords):
        if 'per' in kwords:
            count = self._eg.countForPersistence(kwords['per'])
        elif 'count' in kwords:
            count = kwords['count']

        res_size = self._eg.segmentSize(int(ext),int(count),threshold)

        return res_size

    def coreSize(self,ext,**kwords):
        if 'per' in kwords:
            count = self._eg.countForPersistence(kwords['per'])
        elif 'count' in kwords:
            count = kwords['count']

        return self._eg.coreSize(int(ext),int(count))

    def getConnectivity(self,**kwords):
        print("kwords:", kwords)
        if 'per' in kwords:
            count = self._eg.countForPersistence(kwords['per'])
        elif 'count' in kwords:
            count = kwords['count']

        if 'var' in kwords:
            variation = kwords['var']
        else:
            variation = -1

        triples = self._eg.activeGraph(count,variation)
        triples = np.reshape(triples,[triples.shape[0]//3,3])

        graph = ExtremaConnectivity()

        for t in triples:
            if t[0] in graph:
                graph[t[0]] = graph[t[0]].union(set(t[1:]))
            else:
                graph[t[0]] = set(t[1:])

        for key in graph.keys():
            graph[key] = list(graph[key])

        return graph


    def getGraphIndex(self, **kwords):
        seg = self.segmentation(**kwords)
        con = self.getConnectivity(**kwords)

        #node index set
        nodeIndices = set()
        for left in con.keys():
            nodeIndices.add(left)
            for right in con[left]:
                nodeIndices.add(right)

        #add extrema index
        for ext in seg.keys():
            nodeIndices.add(ext)

        return list(nodeIndices)

    def getSeg(self, **kwords):
        return self.segmentation(**kwords)

    def getGraph(self, **kwords):
        return self.getConnectivity(**kwords)

    def getEGMin(self):
        return self._eg.minimum()

    def getEGMax(self):
        return self._eg.maximum()

    def querySteepestConnection(self, ext, s):
        return self._eg.querySteepestConnection(ext,s)

    def size(self):
        return self._eg.size()

    def persistences(self):
        return self._eg.persistences()

    def variations(self):
        return self._eg.variations()

    def getCount(self, per):

        return self._eg.countForPersistence(per)

    # Query data cube to get selected function
    def getfuncHist(self, brushedrange, ext):
        dims = []
        for i in brushedrange:
            # ii = i.encode('utf-8')
            dims.append(i)

        if ext and ext>=0:
            return self._eg.getHist(ext, 10, dims, True)
        else:
            # print("dims")
            return self._eg.getHist(dims, True)

    def getselectedfunction(self, brushedrange, ext):
        dims = []
        ranges = []
        for i in brushedrange:
            # print(type(i))
            # ii = i.encode('utf-8')
            # print(type(ii))
            dims.append(i)
            ranges.append(brushedrange[i])

        ranges = np.array(ranges)

        if len(dims)>0:
            return self._eg.getSelected1D(dims, ranges, ext, 10)
        else:
            return self.getfuncHist(brushedrange, ext)
##################################
class ExtremumGraphCmp(ExtremumGraph):
    def __init__(self):
        ExtremumGraph.__init__(self)
