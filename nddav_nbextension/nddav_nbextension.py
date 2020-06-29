import json
import ipywidgets as widgets
from traitlets import Bool, Dict, Float, Int, List, Unicode, Union
import socket

from .nddavPackage import *

@widgets.register
class NDDAVDisplay(widgets.DOMWidget):
    _view_name = Unicode("NDDAVDisplayView").tag(sync=True)
    _model_name = Unicode("NDDAVDisplayModel").tag(sync=True)
    _view_module = Unicode("nddav_nbextension").tag(sync=True)
    _model_module = Unicode("nddav_nbextension").tag(sync=True)
    _view_module_version = Unicode('^1.1 || ^2 || ^3').tag(sync=True)
    _model_module_version = Unicode('^1.1 || ^2 || ^3').tag(sync=True)

    _dom_element_id = Unicode(read_only=True).tag(sync=True)
    _port_number = Int().tag(sync=True)
    _num_rows = Int().tag(sync=True)

def startServer(jsonLayout=None, port=5000, module=None, data=None):
    defaultLayout = {
        "column": [
            {"row": ["Filtering", "Neighborhood", "Topological Spine"]},
            {"row": ["Parallel Coordinate", "Scatter Plot"]}
        ]
    }

    if jsonLayout:
        with open(jsonLayout, "r") as read_file:
            layout = json.load(read_file)
    else:
        layout = defaultLayout
    num_rows = len(layout['column'])
    print(layout)

    print(port)
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        s.bind(('', port))
    except:
        s.bind(('',0))
        port = s.getsockname()[1]
    s.close()
    print(port)

    #global vis 
    vis = nddav(layout, port, module, data)
    vis.show()

    display = NDDAVDisplay()
    display._port_number = port
    display._num_rows = num_rows
    return display

