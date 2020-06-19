
class Signal(object):
    """A Signal implements a general callback which can be connected to any bound
    function and when emmitted will call this function.
    """

    def __init__(self,*args):
        """Construct a signal with a given list of types as input parameters

        *args: is expected to be a list of types which will later be
         used for type-checking using isinstance()
        """

        object.__init__(self)

        # Store the types of the arguments for later type checking
        self.types = args

        # The set of callbacks to activate when this signal is emitted
        self.callbacks = set()
        # print "CBs: ", self.callbacks

    def connect(self,func):
        """Connect the given function to the signal.

        Stores the given function as a callback without any type checking
        """
        # print "func that gets added to the callbacks: ", func, type(func)
        # print "Func.emit", func.emit
        # print isinstance(func, signalObject)
        # print isinstance(func, 'instance')

        if isinstance(func,Signal):
            ##print "If func is a signal: ", func.emit
            func = func.emit


        # print func.emit
        ##print "new func: ", func

        #print "Connect: ", self,func
        if func in self.callbacks:
            raise ValueError("A function should not be connected to the same signal twice")

        self.callbacks.add(func)

    def disconnect(self,func):
        """Remove the given function from the list of callbacks."""

        if func not in  self.callbacks:
            raise ValueError("This function is not connected to the signal")

        self.callbacks.remove(func)

    # def emit(self,*args):
    def emit(self, data):
        ##print "Emit Signal Here"
        ##print "CBs: "

        ##for func in self.callbacks:
        ##    ##print func
        ##print " data: ", data


        """Emit the signal by calling all connected functions with the given arguments.

        *args: A list of objects that will be pass on to each callback function.
        """

        # print "Signal Emit ", "data: ", data, "CBs:", self.callbacks
        # print "emit: ",self.callbacks

        # for t,arg in zip(self.types,args):
        #     if not isinstance(arg,t):
        #         raise ValueError("Type mismatch when calling a signal expected type \"%s\" got type \"%s\""
        #                          % (t,type(arg)))
        # print "Emit in Signal"

        for func in self.callbacks:

            # print "Callback: ", func
            # print "data: ", data
            # func(*args)
            # print "data: ", data
            # print type(data)## ==dict:
            # print data.keys()
            func(data)

        # print "Finish emit"
