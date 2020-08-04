import json
import ipywidgets as widgets
from traitlets import Int, Unicode
import socket
from os.path import exists
from os import kill
import signal

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

def createDisplay(layout="sample", port=5000, data=None):
    sampleLayout = {
        "column": [
            {"row": ["Neighborhood", "Topological Spine"]},
            {"row": ["Parallel Coordinate", "Scatter Plot"]}
        ]
    }
    summaryLayout = {
      "column": [{
        "row": ["Summary P.C."]
      }, {
        "row": ["Topological Spine", "Summary Scatter"]
      }]
    }

    '''if exists('config/'+jsonLayout):
        jsonLayout = 'config/'+jsonLayout

    if jsonLayout:
        with open(jsonLayout, "r") as read_file:
            layout = json.load(read_file)
    else:
        layout = defaultLayout'''
    if layout == "summary":
        layout = summaryLayout
    else:
        layout = sampleLayout

    global num_rows
    num_rows = len(layout['column'])

    global vis
    vis = nddav(layout, port, data)
    vis.show()

    display = NDDAVDisplay()
    display._port_number = port
    display._num_rows = num_rows
    return display

def findPort():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    '''try:
        s.bind(('', port))
    except:'''
    s.bind(('',0))
    port = s.getsockname()[1]
    s.close()
    return port

    