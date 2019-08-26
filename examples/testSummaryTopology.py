from __future__ import print_function
import sys
sys.path.append('..')
sys.path.append('.')
from nddavPackage import *

# for debug
import faulthandler; faulthandler.enable()

# layout = {
#     "column": [
#         # {"column": ["Neighborhood","Topological Spine"]},
#         {"row": ["Parallel Coordinate", "Neighborhood"]},
#         {"row": ["Topological Spine", 'Scatter Plot']}
#         # {"column": ["Topological Spine", "Scatter Plot"]}  # 'Scatter Plot']} "Summary P.C.", "Parallel Coordinate"
#         # {"column": ["Filtering", "Neighborhood", "Scatter Plot"]}
#     ]
# }

layout = {
"column": ["Summary P.C.", "Summary Scatter"]
}

vis = nddav(layout, port=5000)
data = vis.addModule(HDFileModule)
# vis.addModule(NeighborhoodModule)
# vis.addModule(EGModule)

data.load("10M_error_fw_output.hdff")
vis.show()
