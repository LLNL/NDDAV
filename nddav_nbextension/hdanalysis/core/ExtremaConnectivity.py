from .Signal import *
from .HDDataObject import *

def is_running_from_ipython():
    from IPython import get_ipython
    return get_ipython() is not None
notebook = is_running_from_ipython()

if notebook:
    from ...hdanalysis.core.HDDataObject import HDDataObject
else:
    from hdanalysis.core.HDDataObject import HDDataObject

class ExtremaConnectivity(dict, HDDataObject):

    def __init__(self):
        dict.__init__(self)
        HDDataObject.__init__(self)
