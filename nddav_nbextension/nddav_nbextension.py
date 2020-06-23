import json
import ipywidgets as widgets
from traitlets import Bool, Dict, Float, Int, List, Unicode, Union

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

def startServer(filename=None, port=5000):
    defaultLayout = {
        "column": [
            {"row": ["Filtering", "Neighborhood", "Topological Spine"]},
            {"row": ["Parallel Coordinate", "Scatter Plot"]}
        ]
    }

    if filename:
        with open(filename, "r") as read_file:
            layout = json.load(read_file)
    else:
        layout = defaultLayout

    print(layout)
    vis = nddav(layout, port)
    vis.show()

    display = NDDAVDisplay()
    display._port_number = port
    return display