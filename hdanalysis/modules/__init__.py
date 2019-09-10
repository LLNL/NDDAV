from hdanalysis.core import *

# the manager for python javascript communication
from .ModuleUIRegistry import *

from .Module import *
from .EGModule import *
from .MultiEGModule import *
from .NeighborhoodModule import *

from .PlotModule import *
from .TopospineModule import *

## summary data representation ##
from .SumDataModule import *
from .SumParallelCoordinateModule import *
from .SumScatterPlotModule import *


# from .DynamicProjModule import *
# from .DimReductionModule import *
# from .ClusteringModule import *
# from .OptimalAxisAlignModule import *
# from .ViewGraphModule import *

try:
    from .DimReductionModule import *
except:
    print ("DimReductionModule not available")

try:
    from .ClusteringModule import *
except:
    print ("ClusteringModule not available")

### view selection and transitions ###
try:
    from .OptimalAxisAlignModule import *
except:
    print ("OptimalAxisAlignModule not available")

try:
    from .DynamicProjModule import *
except:
    print ("DynamicProjModule not available")

try:
    from .ViewGraphModule import *
except:
    print ("ViewGraphModule not available")
# from .ScatterplotPeelingModule import *

###### data access #######
from .DataModule import *
# from .HDFileModule import *
from .DataHook import *
try:
    from .HDFileModule import *
except:
    print ("HDFileModule is not loaded")
