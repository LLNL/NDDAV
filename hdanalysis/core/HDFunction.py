from .HDData import HDData
from .HDWarning import *

NormalizationTypes = ["none","stddev","scaled"]

class HDFunction(HDData):

    def __init__(self):

        super(HDFunction,self).__init__()
        print ("================ HDFunction Init =====================")
        #self.normalization = "none"

    def normalize(self,norm="stddev"):
    #def normalize(self,norm="rescale"):

        if norm not in NormalizationTypes:
            raise ValueError("Normalization \"%s\" not recognized" % norm)

        if norm == "stddev":
            for name in self.dtype.names[:-1]:
                norm = self[name].std()
                if norm == 0:
                    warn("Coordinate %s degenerate ... not normalized" % name,
                         "The %s coordinate is degenerate in the sense that the std deviation of all points is 0. The coordinate is used unchanged." % name)
                else:
                    self[name] = (self[name] - self[name].mean()) / norm

            self.normalization = "stddev"

        elif norm == "scaled":
            for name in self.dtype.names[:-1]:

                norm = self[name].ptp()
                if norm == 0:
                    warn("Coordinate %s degenerate ... not normalized" % name,
                         "The %s coordinate is degenerate in the sense that the range of all points is 0. The coordinate is used unchanged." % name)
                else:
                    self[name] = (self[name] - self[name].mean()) / norm

            self.normalization = "scaled"

        elif norm == "none":
            self.normalization = "none"

    def domain(self):
        return self[list(self.dtype.names[:-1])]

    def domainNames(self):
        return list(self.dtype.names[:-1])

    def rangeNames(self):
        return list(self.dtype.names[-1])
