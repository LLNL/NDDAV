import numpy as np
# from HDFunction import HDFunction
# from HDData import HDData
from .HDDataObject import *
from .HDWarning import *

class GlobalSummary(np.ndarray, HDDataObject):

    def __new__(cls,input_array,*args):
        obj = np.asarray(input_array).view(cls)
        HDDataObject.__init__(obj,args)
        return obj

    def __array_finalize__(self,obj):
        if obj is None:
            return

        HDDataObject.__init__(self,obj)
        self.range = []
        self.alldim = []
        self.combination = {}

    def addName(self, names):
        self.alldim.append(names)

    def names(self):
        return self.alldim

    def addRange(self, name, range):
        self.range.append(name)
        for i in range:
            self.range.append(i)

    def getrange(self):
        return self.range

    def addComb(self, name, val):
        self.combination[name] = val

    def getComb(self):
        return self.combination


class MultipleHistogram(np.ndarray, HDDataObject):

    def __new__(cls,input_array,*args):
        obj = np.asarray(input_array).view(cls)

        HDDataObject.__init__(obj,args)


        return obj

    def __array_finalize__(self,obj):

        if obj is None:
            return

        HDDataObject.__init__(self,obj)


class SingleHistogram(np.ndarray, HDDataObject):

    def __new__(cls,input_array,*args):
        obj = np.asarray(input_array).view(cls)
        HDDataObject.__init__(obj,args)
        return obj

    def __array_finalize__(self,obj):

        if obj is None:
            return
        HDDataObject.__init__(self,obj)
