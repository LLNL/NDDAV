import numpy as np
from .Signal import *

class SharedValueProxy(object):

    # Create a proxy with the given name and type
    def __init__(self, name, value):

        object.__init__(self)

        if isinstance(value,type):
            self.dataType = value
            self._value = value()
        else:
            self.dataType = value.__class__
            self._value = value

        self.name = name
        self.changedSignal = Signal(self.dataType)

    def set(self,value):
        # print "SharedValueProxy: %s set " % self.name, value, self._value
        # print "Set value from sharedvalueproxy"
        self._value = value
        # print ("SharedValueProxy: %s set " %self.dataType, value.__class__)
        if self.dataType != value.__class__:
            raise ValueError("Type mismatch")

        self.changedSignal.emit(self._value)

        # print "Finish set"


    def get(self):
        return self._value
