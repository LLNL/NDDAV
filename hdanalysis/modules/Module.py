from hdanalysis.core import *
#import pdb
#pdb.set_trace()

class Module(object):
    def __init__(self, dataContext=None):
        super(Module,self).__init__()

        self._inputPorts = []
        self._outputPorts = []

        self._context = dataContext

    ###### do we really need input output port #####
    '''
        get reference to dataProxy from context
    '''
    def makeInputPort(self,name,proxyType):
        proxy = self._context.registerInput(proxyType)
        setattr(self,name,proxy)
        self._inputPorts.append(getattr(self,name))

    def makeOutputPort(self,name,proxyType):
        proxy = self._context.registerOutput(proxyType)
        setattr(self,name,proxy)
        self._outputPorts.append(getattr(self,name))

    def makeSharedValue(self,name,instance):
        sharedValue = self._context.registerSharedValue(name, instance)
        setattr(self, name, sharedValue)

    # def linkWithoutReturn(self, *args):
    #     inputs = args[0:-1]
    #
    #     func = lambda _: args[-1](inputs)
    #     for i in inputs:
    #         i.changedSignal.connect(func)

    def link(self, *args):
        # print "!!!!!!!!!!!!!!!!!!!!Module.link: ", args
        inputs = args[0:-2]
        output = args[-2]

        func = lambda _: self.update(*args)
        for i in inputs:
            i.changedSignal.connect(func)

    def update(self,*args):

        print ("\n Module.update: \n", args[-1], "\n")
        inputs = args[0:-2]
        output = args[-2]
        callback = args[-1]

        # print ("DI's Debugging","\nInputs: ", inputs, "\nOutputs: ", output, "\nCB: ", callback)

        # Test whether all our inputs are up to date
        if DataHistory.checkHistory(*inputs):
            #print "================== Go into checkHistory ====================="
            # print "===========   checkHistory = ", DataHistory.checkHistory(*args[0:-1])

            # if the output is already computed also return
            if output.valid() and DataHistory.checkHistory(*args[0:-1]):
                #print "   output.valid = ", output.valid()
                #print "   checkHistory = ", DataHistory.checkHistory(*args[0:-1])
                #print "!! result already computed"
                return

            # print ("Will execute the cb")
            # get data from proxy
            new_args = [a.getData() for a in inputs]

            # And update the output using the callback
            output.setData(callback(*new_args))

            if output.valid():
                #print "Valid Name = ", self._makeOutputName(inputs[0].getData().name)
                output.getData().name = self._makeOutputName(inputs[0].getData().name)
                # If all versions match we update our dependence versions
                for i in inputs:
                    output.history.updateHistory(i.history)

            else:
                print ("\n  In valid Result Computed in ", callback, "\n")

    def _makeOutputName(self,name):
        return self.__class__.__name__ + "(%s)" % name


'''
    def __init__(self,parent=None):
        #print "Module.__init__"
        super(Module,self).__init__()

        self._manyInputProxyList = []

        self._inputPorts = []
        self._outputPorts = []

        self._context = None
        self._parent = parent
        self._children = []

        # if the parent module is not empty then the data context will
        # be parent's context.
        if self._parent != None:
            self._context = self._parent._context


    def publishes(self):
        return self._outputPorts

    def subscribes(self):
        return self._inputPorts

    def reset(self,module):
        return

    def addSubModule(self, module_type,**kwargs):
        print "Module.addSubModule", kwargs
        self._children.append(module_type(self,**kwargs))
        #print "\n\nCheckpoint "
        self._children[-1].parent = self
        return self._children[-1]

    def removeSubModule(self, module):
        return

    def makeSharedValue(self,name,instance):
        tmp = SharedValueProxy(name,instance)
        setattr(self,name,tmp)

        if self._parent != None:
            self._parent._context.addSharedValue(getattr(self,name))


    def makeInputPort(self,name,type):
        #print "makeInputPort ", type, self._parent
        tmp = DataProxy(type)
        setattr(self,name,tmp)
        self._inputPorts.append(getattr(self,name))

        if self._parent != None:
            self._parent._context.subscribe(self._inputPorts[-1])
        else:
            tmp.updateSignal.connect(tmp._setData)

    def makeInputPort(self,name,type):

        tmp = ManyProxy(type)
        setattr(self,name,tmp)
        self._inputPorts.append(getattr(self,name))

        self._manyInputProxyList.append(getattr(self,name))

        if self._parent != None:
            self._parent._context.subscribe(self._inputPorts[-1])

        # This makes no sense for ManyProxies .. but we need to replace the
        # functionality somehow
        #else:
        #tmp.updateSignal.connect(tmp._setData)

    def makeOutputPort(self,name,type):

        setattr(self,name,DataProxy(type))
        self._outputPorts.append(getattr(self,name))
        self._context.register(self._outputPorts[-1])

    def link(self,*args):
        #print "Module.link: ", args
        inputs = args[0:-2]
        output = args[-2]

        func = lambda d,v: self.produce(*args)
        for i in inputs:
            output.sources[i] = i.version
            i.changedSignal.connect(func)

        ## what is this for??
        func(None,None)


    def produce(self,*args):

        print "\n Module.produce: \n", args[-1], "\n"
        inputs = args[0:-2]
        output = args[-2]
        callback = args[-1]

        # Test whether all our inputs are up to date
        for i in inputs:
            # if not i.valid():
            print "=====input======:", i.getName()
            ####### FIXME synced is removed to fix undetermistic version mismatch ######
            if not i.valid() or not i.synced():
                return

        # If all versions match we update our dependence versions
        for i in inputs:
            output.sources[i] = i.version

        new_args = [a.getData() for a in inputs]

        # And update the output using the callback. Note that this
        # automatically calls output.changed()
        output.setData(callback(*new_args))

        if output.valid():
            output.getData().name = self._makeOutputName(inputs[0].getData().name)
        else:
            print "\n  In valid Result Computed in ", callback, "\n"

    #def proxsChanged(self,proxy):
    #print "Module.proxsChanged"
    #pass

    def _makeOutputName(self,name):
        return self.__class__.__name__ + "(%s)" % name
'''
