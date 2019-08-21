# separation of data and view
# simplified and complex UI for the deploy and design of the visualization
from flask import Flask
import socketio
import eventlet
from hdanalysis.modules import *
from hdanalysis.core import *

import sys
import os
import argparse

app = Flask(__name__)
sio = socketio.Server(ping_timeout=12000, ping_interval=12000)
fApp = socketio.Middleware(sio, app)
registry = ModuleUIRegistry(sio)

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

@app.route('/')
def index():
    print("==============  clear  =================")
    registry.clear()
    registry.setData("componentLayout", layout)
    print("update layout")
    app.send_static_file('appIndex.html')


@app.route('/<name>')
def views(name):
    return {
        'template_view': app.send_static_file('viewTemplates/template_view.mst'),
        'clustering_view': app.send_static_file('viewTemplates/clustering_view.mst'),
        'dimension_reduction_view': app.send_static_file('viewTemplates/dimension_reduction_view.mst'),
        'neighborhood_view': app.send_static_file('viewTemplates/neighborhood_view.mst'),
        'table_view': app.send_static_file('viewTemplates/table_view.mst'),
        'filter_view': app.send_static_file('viewTemplates/filter_view.mst'),
        'hdfile_view': app.send_static_file('viewTemplates/hdfile_view.mst')
    }.get(name)


# This listens to nddav message
@sio.on('message', namespace='/nddav')
def parsingMessage(sid, msg):
    # if registry:
    print('message', sid)
    registry.parsingMessage(msg)

@sio.on('disconnect', namespace='/nddav')
def onDisconnect(sid):
    # if registry:
    print('\n\n!!!!!!!!! socketIO disconnected !!!!!!!!\n\n', sid)
    # registry.parsingMessage(msg)

def main(arguments):
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    parser.add_argument('--data', help="Path to data file.")
    parser.add_argument('--graph', help="Path to graph file.")
    parser.add_argument('--function', help="List of dimensions last one beng the range.")
    parser.add_argument('--port', default=5000, help="Specified the port for the localhost.", type=int)

    args = parser.parse_args(arguments)
    registry.setArgs(args)

    eventlet.wsgi.server(eventlet.listen(('localhost', args.port)), fApp)


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
