from .Signal import *
from .HDDataObject import *
from .HDDataObject import HDDataObject

class Matrix(HDDataObject):

    def __init__(self):
        HDDataObject.__init__(self)

    def setMatrix(self, mat):
        self.mat = mat

    def getMatrix(self):
        return self.mat

class DataMatrix(Matrix):
    def __init__(self):
        Matrix.__init__(self)

class ProjMatrix(Matrix):
    def __init__(self):
        Matrix.__init__(self)

    def setProjMatrixType(self, type):
        self.matrixType = type

    def getProjMatrixType(self):
        return self.matrixType

class MatrixList(HDDataObject):
    def __init__(self):
        HDDataObject.__init__(self)
        self.matList = []

    def addMatrix(self, mat):
        self.matList.append(mat)

    def setMatrixList(self, listOfMatrix):
        self.matList = listOfMatrix

    def getMatrixList(self):
        return self.matList
