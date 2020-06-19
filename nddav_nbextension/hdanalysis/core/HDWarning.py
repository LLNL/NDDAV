
def warn(short,doc=None):
    import warnings
    warnings.warn(HDWarning(short,doc))
    #warnings.warn(short)

class HDWarning(Warning):

    def __init__(self,short,doc=None):

        Warning.__init__(self)

        # The short message
        self._short = short

        if doc == None:
            self._doc = short
        else:
            # The long message
            self._doc = doc

    def __str__(self):
        return self._short

    def doc(self):
        return self._doc
