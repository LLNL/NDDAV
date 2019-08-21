# python interface for accessing the NDDAV visualization
# encapsulate the nddav server
from flask import Flask
import socketio
import eventlet
from hdanalysis.modules import *
from hdanalysis.core import *
import threading

app = Flask(__name__)
sio = socketio.Server(ping_timeout=12000, ping_interval=12000)
fApp = socketio.Middleware(sio, app)
registry = ModuleUIRegistry(sio)

layoutConfig = None

class nddav:
    def __init__(self, visLayout, port=5000):
        global layoutConfig
        layoutConfig = visLayout
        self.port = port

    def addModule(self, moduleName):
        return registry.addPurePythonModule(moduleName)

    def getModule(self, moduleName):
        return registry.getModule(moduleName)

    def setAfterInitilizationCallback(self, callback):
        registry.setAfterInitilizationCallback(callback)

    @app.route('/')
    def index():
        registry.setData("componentLayout", layoutConfig)
        return app.send_static_file('appIndex.html')


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

    @sio.on('message', namespace='/nddav')
    def parsingMessage(sid, msg):
        # if registry:
        registry.parsingMessage(msg)

    @sio.on('disconnect', namespace='/nddav')
    def onDisconnect(sid):
        print ('\n\n!!!!!!!!! socketIO disconnected !!!!!!!!\n\n', sid)

    def show(self):
        eventlet.wsgi.server(eventlet.listen(('localhost', self.port)), fApp)
