from .Module import *
from numpy.lib.recfunctions import merge_arrays

'''
Define data's domain and range of a function
'''
class DataModule(Module):

    def __init__(self, parent=None, filename=None, function=None):
        print ("====== DataModule.__init__", parent, filename, function)
        super(DataModule,self).__init__(parent)

        self._condition = None
        self._domain = None
        self._range = None
        self._customFunction = None
        self._norm = "none"

        # what is properties?
        # self.makeInputPort("properties",HDProperties)

        self.makeOutputPort("data",HDData)
        # self.makeOutputPort("filtered_properties",HDProperties)
        self.makeOutputPort("function",HDFunction)

        # only need to create a function if no function is defined
        # self.link(self.data, self.output, self.computeOutput)

        if filename:
            print ("\n ================== Load Dataset ====================: ", filename)
            self.loadFile(filename)

        if function:
            axes = function.split()
            print ("\n Setting Function: ", axes)
            self.setFunction(axes[:-1],axes[-1])
            # self._setFunction(axes[:-1],axes[-1], 0)


        self.link(self.data, self.function, self.computeFunction)


        # self.link(self.properties, self.filtered_properties, self.filter_properties)

    def computeFunction(self, data):
        print ("============= DataModule.computeFunction:\n ", data.__class__)
        self._domain = list(data.dtype.names[0:-1])
        self._range = data.dtype.names[-1]
        # print (self._domain, self._range)
        return data.function(self._domain+[self._range],norm=self._norm)

        # If we haven't specified a domain
        # if self._domain == None or self._range == None:
        #     # We look for a domain in our parents
        #     up = self._parent
        #     #### not need hierarchy ####
        #     while up != None:
        #         if isinstance(up,FilterModule):
        #             if up._domain != None and up._range != None:
        #                 self._domain = up._domain
        #                 self._range = up._range
        #         up = up._parent
        #
        # if self._domain != None and self._range != None:
        #     if self._range == "Custom":
        #         try:
        #             #print "custom = " + self._customFunction
        #             exec("custom = " + self._customFunction)
        #         except:
        #             custom = np.zeros(data.shape[0],dtype=[('Custom','f4')])
        #         func = merge_arrays((data[self._domain], custom), asrecarray=True, flatten=True).copy().view(HDFunction)
        #         func.normalize(norm=self._norm)
        #         #print func.dtype.names,func.dtype.names[:-1] + ('Custom',)
        #         func.dtype.names = func.dtype.names[:-1] + ('Custom',)
        #         return func
        #     else:
        #         return data.function(self._domain+[self._range],norm=self._norm)
        # else:
        #     print "!!!!!!! no function is created !!!!!!"
        #     return None


    ### for the filtering step ###
    def computeOutput(self,data):
        print ("FilterModule.computeOutput: ", data.__class__)

        if self._condition != None:
            indices = np.where(self._condition)[0] # We create a new view into the data
            return data.take(indices)
        else:
            return data

    def filter_properties(self,properties):
        print ("FilterModule.filter_properties: ", properties.__class__)

        if self._condition != None:
            indices = np.where(self._condition)[0] # We create a new view into the data
            return self.properties.getData().take(indices)
        else:
            return self.properties.getData()

    def getModuleInfoDict(self):
        return {"domain":self._domain,
                "range":self._range,
                "norm":self._norm,
                "vars":self.data.getData().dtype.names}

    def loadData(self, ustring, filename):
        # print ustring, filename
        # with open(filename, "w") as f:
            # f.write(str(ustring))
        # print ustring
        data = loadStr(ustring, filename)

        # ustring: string that represents the rawdata file

        #print "loadData, ", ustring, filename

        # data = loadFile(str(filename))
        #print "loadData: "
        #print data

        ## data: some numpy array that stores the raw data

        self.data.setData(data)



    def loadFile(self, filename):
        # print filename
        data = loadFile(str(filename))
        # data = loadFile("peaks489.csv")
        self.data.setData(data)
        # self.data._setData(data, 0)
        # self.setFunction(list(data.dtype.names[0:-1]), data.dtype.names[-1])


    ###### why any setFunction is necessary
    def _setFunction(self,domain,range,version, norm="stddev"):
        self._domain = domain
        self._range = range
        self._norm = norm

        self.function._setData(self.data.getData().function(self._domain+[self._range],norm=self._norm))
        ### can not set function before having access to data
        # if self.output.valid():
            # self.function._setData([],version)


    def setFunction(self,domain,range,norm="stddev"):
        self._domain = domain
        self._range = range
        self._norm = norm

        if self.data.valid():
            # print "setFunction"
            self.function.setData(self.computeFunction(self.data.getData()))


    def expr(self,expr):

        # print "Trying to set expression \"%s\"" % expr

        if expr == "":
            self._condition = [True] * self.data.getData().shape[0]
        else:
            condition = expr.replace(')',' )')

            # First replace the short version of the expression with the long one
            for i,n in enumerate(self.data.getData().dtype.names):
                condition = condition.replace('x%d' % i,n)

            # The replace the attribute names with the actual code
            for i,n in enumerate(self.data.getData().dtype.names):
                condition = condition.replace(n,'self.data.getData()[\'%s\']' % n)

            print ("np.where(%s)[0] " % condition)
            exec ("np.where(%s)[0] " % condition)
            exec ("self._condition = " + condition)

        self.output.setData(self.computeOutput(self.data.getData()))
        if self.properties.valid():
            self.filtered_properties.setData(self.filter_properties(self.properties.getData()))

        print ("Filtered from %d row to %d rows" % (self.data.getData().shape[0],self.output.getData().shape[0]))

        return expr

    def setData(self,data):
        self.data.setData(data)

    def set_properties(self,properties):
        self.properties.setData(properties)

    def _makeOutputName(self,name):
        return name
