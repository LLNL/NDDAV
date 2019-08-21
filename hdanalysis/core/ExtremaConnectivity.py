from .Signal import *
from .HDDataObject import *
from hdanalysis.core.HDDataObject import HDDataObject


class ExtremaConnectivity(dict, HDDataObject):

    def __init__(self):
        dict.__init__(self)
        HDDataObject.__init__(self)
