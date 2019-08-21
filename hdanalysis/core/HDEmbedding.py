from .HDData import HDData


class HDEmbedding(HDData):

    def getMethod(self):

        try:
            return self.method;
        except:
            return "Unknown"

    def setMethod(self,m):
        self.method = m
