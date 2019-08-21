from .Signal import *
from .HDDataObject import *
from .HDData import *

class Segment(list):

    def __init__(self,arg):

        if isinstance(arg,Segment):
            list.__init__(self,arg)
            self.representative = int(arg.representative)
        elif isinstance(arg,list) or isinstance(arg, np.ndarray):
            list.__init__(self,arg)
            self.representative = arg[0]
        else:
            list.__init__(self,[arg])
            self.representative = arg

    def __hash__(self):
        return self.representative

    def __eq__(self,other):
        try:
            return self.representative == int(other)
        except:
            return self.representative == other.representative

    def __iadd__ (self,seg):
        list.__iadd__(self,seg)



class Segmentation(dict,HDDataObject):

    def __init__(self):
        dict.__init__(self)
        HDDataObject.__init__(self)

        #print "Segmentation.__init__()"

    def __setitem__(self,key,value):
        if not isinstance(value,Segment):
            raise ValueError("A segmentation can only contain segments")

        if key != value.representative:
            raise ValueError("The key and the representative must match")

        dict.__setitem__(self,key,value.sort())

    def __iadd__(self,segment):
        if not isinstance(segment,Segment):
            raise ValueError("A segmentation can only contain segments")

        dict.__setitem__(self,segment.representative,segment)
        return self

    def index_list(self,size=0):

        if size == 0:
            for seg in self.values():
                for p in seg:
                    size = max(size,p)
            size += 1

        indices = np.empty(shape=[size],dtype=np.int32)

        for i,seg in enumerate(self.values()):
            for p in seg:
                indices[p] = i

        indices = indices.view(dtype=[("seg-ids",'i4')]).view(HDData)
        indices.name = "Seg-ids"

        return indices
