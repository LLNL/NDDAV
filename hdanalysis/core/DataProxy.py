from .Signal import *
from .DataHistory import *

class DataProxy(object):

    def __init__(self, proxyType):
        # print "====== DataProxy Init ======"
        self.type = proxyType
        self._data = None
        self.changedSignal = Signal(self.type,type(1))
        self.history = DataHistory(self)

    def setData(self, data):
        # print ("*************** Data Set ********************************\n")
        self._data = data
        # print "data = ", self._data, ".....\n"

        # print ("Finish data set \n")
        # print "setData in DataProxy:", type(data)
        self.history.updateDataRef()
        # print "DataProxy, SetData:             "
        self.changedSignal.emit(self._data)

    def getData(self):
        return self._data

    def valid(self):
        # print "************************ Check Valid **************************************\n"
        # print " data = ", self._data

        if self._data is None:
            return False
        else:
            return True

    """
    The basic proxy for any kind of data object.

    Signals:
    changedSignal(type,version):
        Signal emmited when the data is changed

    """

    '''
    def __init__(self, arg):
        """ Construct a DataProxy from a type."""

        object.__init__(self)

        # IF we are given a type
        if isinstance(arg,type):
            # We take it and create no object
            self.dataType = arg
            self._data = None
        else: # Otherwise, we use the type of the given argument
            self.dataType = type(arg)
            # And initialize the data with the given argument
            self._data = type(arg)(arg)


        # A reference to the master copy to compare version numbers
        self.master_copy = self

        # The changed signal is called whenever the local data
        # and version have been updated. This is used for internal
        # notifications to trigger further processing
        self.changedSignal = Signal(self.dataType,type(1))

        # The update signal is called whenever a new version of
        # the data is available
        self.updateSignal = Signal(self.dataType,type(0))

        # Notify somebody that my name has changed
        self.nameChangeSignal = Signal(str,str)


        # The version number of this proxy
        self.version = 0

        # A dictionary mapping proxies to version number that was used
        # to create our data
        self.sources = dict()

    def getName(self):
        if self._data is None:
            return 'EmptyProxy'
        else:
            return self._data.name

    # Returns the data
    def getData(self):
        return self._data

    # Return the version
    def getVersion(self):
        return self.version

    def setData(self,data):
        """External call to set change the internal data.

        This will ultimately increase the version number and publish
        the new data under the new version by emitting an update
        signal. Note that this does *not* directly set the
        data. Instead, an updateSinal will be triggered which in turn
        will call the approriate _setData function
        """
        #print "DataProxy::setData"

        if data is None:
            return

        if self.dataType != data.__class__:
            print self.dataType,  data.__class__
            raise ValueError("Type mismatch")

        self.updateSignal.emit(data,self.version+1)

    def _setData(self,data,version):
        """Internal call to set data and its version.

        This will emit a changedSignal and if necessary a nameChanged
        signal indicating that the source itself has changed.
        """
        print "DataProxy::_setData1", data.__class__,version

        if data is None:
            return

        print "DataProxy::_setData2", data.name
        if self._data is None:
            print "Emit nameChange to ",data.name
            self.nameChangeSignal.emit("Default",data.name)
        elif self._data.name != data.name:
            print "Emit ",self._data.name,data.name
            self.nameChangeSignal.emit(self._data.name,data.name)

        self._data = data
        self.version = version

        self.changedSignal.emit(self._data,self.version)


    def valid(self):
        if self._data is None:
            return False
        else:
            return True

    def synced(self):
        """Determine whether the proxy is up-to-date with the latest versions."""

        # If this local copy hasn't been updated
        if self.version != self.master_copy.version:
            print "synced(",self.getName(),") ==> Version difference:", self.version, self.master_copy.version
            return False

        # IF this is an input port whose master copy is not ready
        if self != self.master_copy and not self.master_copy.synced():
            print "synced(",self.getName(),") ==> this is an input port whose master copy is not ready"
            return False

        # If one of my sources has a different version or is not synced
        for s in self.sources:
            if self.sources[s] != s.version or not s.synced():
                print "synced(",self.getName(),") ==> one of the sources has a different version or is not synced"
                return False

        return True
'''
