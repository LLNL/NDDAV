'''
Store the actual data, and host all modules, and dataProxies
'''
from .DataProxy import *
from .SharedValueProxy import *

class DataContext(object):
    def __init__(self):
        object.__init__(self)
        self._store = dict()
        self._sharedValues = dict()
        self._modules = []

    def addModule(self, module_type, **kwargs):
        print ("DataContext.addSubModule", module_type, kwargs)
        self._modules.append(module_type(self,**kwargs))
        #print "\n\nCheckpoint "

        new_module = self._modules[-1]
        for proxy in new_module._inputPorts:
            if proxy.valid():
                proxy.changedSignal.emit(proxy.getData())


        return self._modules[-1]

    def registerSharedValue(self, name, value):
        if name not in self._sharedValues.keys():
            self._sharedValues[name] = SharedValueProxy(name, value)
        return self._sharedValues[name]

    def registerInput(self, proxyType):
        if proxyType not in self._store.keys():
            proxy = DataProxy(proxyType)
            self._store[proxyType] = [proxy]

        return self._store[proxyType][-1]

    def registerOutput(self, proxyType):

        #### if this type of proxy exists ####
        # print "==================================================="
        # print "Keys stored", self._store.keys()
        # print proxyType, type(proxyType)
        if proxyType in self._store.keys():
            print ("Proxy already exits for :", proxyType)
            print (self._store[proxyType])
            if self._store[proxyType][-1].valid():
                proxy = DataProxy(proxyType)
                self._store[proxyType].append(proxy)
                return proxy
        else:
            # print "Register"
            proxy = DataProxy(proxyType)
            self._store[proxyType] = [proxy]

        return self._store[proxyType][-1]
