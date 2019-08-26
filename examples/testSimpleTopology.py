from __future__ import print_function
import sys
sys.path.append('..')
sys.path.append('.')
from nddavPackage import *

# for debug
import faulthandler; faulthandler.enable()

layout = {
    "column": [
        # {"column": ["Neighborhood","Topological Spine"]},
        {"row": ["Parallel Coordinate", "Neighborhood"]},
        {"row": ["Topological Spine", 'Scatter Plot']}
        # {"column": ["Topological Spine", "Scatter Plot"]}  # 'Scatter Plot']} "Summary P.C.", "Parallel Coordinate"
        # {"column": ["Filtering", "Neighborhood", "Scatter Plot"]}
    ]
}

vis = nddav(layout, port=5000)
data = vis.addModule(DataHook)
vis.addModule(NeighborhoodModule)
vis.addModule(EGModule)

data.loadFile("data/terrain1.txt")
vis.show()
