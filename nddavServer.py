from nddavPackage import *

import sys
import os
import argparse

############# preprocessing data ############
# layout = {
#     "column": [
#         {"row": ["HDFile", "Summary P.C."]},
#         ##{"column": ["Topological Spine", "Summary P.C.", "Parallel Coordinate"]} #'Scatter Plot']}
#         {"row": ["Topological Spine","Summary Scatter"]}  # 'Scatter Plot']} "Summary P.C.", "Parallel Coordinate"
#
#     ]
# }

############### small data test #################
defalutLayout = {
    "column": [
        {"row": ["Filtering", "Neighborhood", "Topological Spine"]},
        {"row": ["Parallel Coordinate", "Scatter Plot"]}
    ]
}


def main(arguments):
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    parser.add_argument('--port', default=5000, help="Specified the port for the localhost.", type=int)
    parser.add_argument('--layout', default=None, help="Specify layout", type=str)

    args = parser.parse_args(arguments)
    if args.layout:
        with open(args.layout, "r") as read_file:
            layout = json.load(read_file)
    else:
        layout = defalutLayout

    vis = nddav(layout, port=args.port)
    vis.show()


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
