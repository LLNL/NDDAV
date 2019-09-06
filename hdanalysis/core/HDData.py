import numpy as np
import hdtopology as hdt

try:
    from StringIO import StringIO #py2
except ImportError:
    from io import StringIO #py3

import re
import struct
from .HDWarning import *
from .HDDataObject import *
from os.path import split,splitext

class HDData(np.recarray,HDDataObject):
    """HDData is a wrapper around a numpy array of records or a view thereof
    which also maintains a list of column names called attributes
    """

    def __new__(cls,input_array,*args):
        #print "===================== HDData Initialization 1 ======================="
        obj = np.asarray(input_array).view(cls)

        HDDataObject.__init__(obj,args)

        obj.normalization = "none"

        return obj

    def __array_finalize__(self,obj):
        #print "===================== HDData Initialization 2 ======================="
        if obj is None:
            return

        HDDataObject.__init__(self,obj)

    def function(self,indices,norm="stddev"):
        #print "===================== HDData function ======================="
        from .HDFunction import HDFunction
        print (indices)
        print (self.dtype.names)
        f = self[indices].copy().view(HDFunction)
        f.name = self.name + "_f"

        if f.shape != np.unique(f[indices[:-1]]).shape:
            warn("Pointset not a function",
                 "The given domain does not form a function meaning that there exist duplicate points")

        f.normalize(norm=norm)

        return f

    #def hdsum(self,indices=None):#,norm="stddev"):
    #    from HDSum import HDSum
    #    #print "===================== HDData sum ======================="
    #
    #     #print indices
    #     #print self.dtype.names
    #     if indices:
    #         f = self[indices].copy().view(HDSum)
    #     #f.name = self.name + "_f"
    #     else:
    #         f = self.copy().view(HDSum)
    #
    #     # if f.shape != np.unique(f[indices[:-1]]).shape:
    #     #    warn("Pointset not a function",
    #     #         "The given domain does not form a function meaning that there exist duplicate points")
    #
    #     #f.normalize(norm=norm)

    #    return f


    def dim(self):
        return len(self.dtype.names)

    def names(self):
        return self.dtype.names

    def asArray(self):
        return self.view('f4').copy().reshape([self.shape[0],self.dim()])

    def toBinaryPoints(self,filename):
        output = open(filename,"w")

        output.write("%d %d\n" % (self.shape[0],self.dim()))
        self.tofile(output)

        output.close()



def guessDataName(filename):
    # First remove any path components
    name = split(filename)[1]

    # Second remove the extension
    return str(splitext(name)[0])

def loadCSV(filename):

    ###
    ##
    # some data cell looks like this, so there are possible bugs in
    # this code '0.687492765\r0.150155902'
    #
    input = open(filename,'r')

    names = input.readline().split(',')
    names = [n.rstrip().lstrip() for n in names]
    try:
        # If we can convert the name into a number we assume no names
        # hvae been given
        num = float(names[0])

        names = ['X%d' % i for i in range(0,len(names))]

        input.close()
        input = open(filename,'r')
    except:
        pass

    types = ['f4']*len(names)

    #we are here yesterday and just finish this function,
    print (names,types)
    data = np.loadtxt(input,dtype=list(zip(names,types)),delimiter=',').view(HDData)
    data.name = guessDataName(filename)

    return data

def loadASCII(filename):

    input = open(filename,'r')
    dim = len(input.readline().split())
    input.close()

    names = ['X%d' % i for i in range(0,dim)]
    types = ['f4']*dim

    data = np.loadtxt(filename, dtype=np.float32)

    data = data.view(dtype=list(zip(names,types)) ).view(HDData)
    data.name = guessDataName(filename)

    return data

def loadBinaryPts(filename):

    input = open(filename,'r')
    line = input.readline().split()
    n = int(line[0])
    dim = int(line[1])

    names = ['X%d' % i for i in range(0,dim)]
    types = ['f4']*dim

    data = np.fromfile(input,dtype=np.float32)
    data = data.reshape([n,dim])
    data = data.view(dtype=list(zip(names,types))).view(HDData)
    data.name = guessDataName(filename)

    return data

def loadRecarray(filename):
    import cPickle

    input = open(filename,'rb')

    t = cPickle.load(input)
    data = np.fromfile(input)
    input.close()

    return data.view(dtype=t).view(HDData)


def loadFile(filename):
    ###### assuming the file is already upload to the server ######
    if splitext(filename)[1] == ".csv":
        data = loadCSV(filename)
    elif splitext(filename)[1] == ".pts":
        data = loadBinaryPts(filename)
    elif splitext(filename)[1] == ".txt":
        data = loadASCII(filename)
    elif splitext(filename)[1] == ".recarray":
        data = loadRecarray(filename)
    else:
        warn("Filetype of \"%s\" not recognized" % filename)
        return None

    return data
