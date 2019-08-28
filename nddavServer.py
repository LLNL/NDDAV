from nddavPackage import *

import sys
import os
import argparse

############# preprocessing data ############
layout = {
    "column": [
        {"row": ["HDFile", "Summary P.C."]},
        ##{"column": ["Topological Spine", "Summary P.C.", "Parallel Coordinate"]} #'Scatter Plot']}
        {"row": ["Topological Spine","Summary Scatter"]}  # 'Scatter Plot']} "Summary P.C.", "Parallel Coordinate"

    ]
}

############### small data test #################
# layout = {
#     "column": [
#         {"row": ["Filtering", "Neighborhood","Topological Spine"]},
#         # {"column": ["Topological Spine", "Summary P.C.", "Parallel Coordinate"]}, #'Scatter Plot']}
#         {"row": ["Parallel Coordinate", "Scatter Plot"]}  # 'Scatter Plot']} "Summary P.C.", "Parallel Coordinate"
#         # {"column": ["Filtering", "Neighborhood", "Scatter Plot"]}
#     ]
# }


# layout = {
#     "row": [
#         {"column": ["OptimalAxisAlign", 'Scatter Plot']},
#         {"column": ["DynamicProjection", "Filtering"]}
#     ]
# }


def main(arguments):
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    parser.add_argument('--port', default=5000, help="Specified the port for the localhost.", type=int)

    args = parser.parse_args(arguments)

    vis = nddav(layout, port=args.port)
    vis.show()


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
