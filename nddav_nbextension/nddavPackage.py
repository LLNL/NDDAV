# python interface for accessing the NDDAV visualization
# encapsulate the nddav server

import eventlet
from flask import Flask, Response, request, redirect, send_from_directory, url_for
import socketio
import threading
import sys
import os
import multiprocess as mp
from multiprocess import Queue
import os.path as op
from functools import partial
import slugid
import requests
import time
import numpy as np

from .hdanalysis.modules import *
from .hdanalysis.core import *

#### for file upload ####
from werkzeug.utils import secure_filename

app = Flask(__name__, static_folder='../js/static')

#mgr = socketio.RedisManager('redis://')

sio = socketio.Server(ping_timeout=12000, ping_interval=12000, cors_allowed_origins='*')#, client_manager=mgr)
fApp = socketio.Middleware(sio, app)
registry = ModuleUIRegistry(sio)

UPLOAD_FOLDER = "upload"
ALLOWED_EXTENSIONS = set(['txt', 'csv', 'db', 'rearray', 'pts'])
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

layoutConfig = None

class nddav:

    processes = {}

    def __init__(self, visLayout, port=5000, data=None):
        global layoutConfig
        layoutConfig = visLayout
        self.port = port
        global hasModule
        global moduleData
        hasModule = False
        moduleData = None
        if data is not None:
            hasModule = True
            moduleData = data

    def addModule(self, moduleName):
        print("nddav adding module")
        return registry.addPurePythonModule(moduleName)

    def getModule(self, moduleName):
        return registry.getModule(moduleName)

    def setAfterInitilizationCallback(self, callback):
        registry.setAfterInitilizationCallback(callback)

    @app.route('/')
    def index():
        '''if moduleType is not None:
            registry.addPurePythonModule(moduleType)'''
        registry.setData("componentLayout", layoutConfig, hasModule, moduleData)
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

    @app.route('/upload', methods=['POST','GET'])
    def uploadFile():
        def allowed_file(filename):
            return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

        if request.method == 'POST':
            if 'file' not in request.files:
                print('No file part')
                return redirect(request.url)

            file = request.files['file']
            # if user does not select file, browser also
            # submit an empty part without filename
            if file.filename == '':
                print('No selected file')
                return redirect(request.url)
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                
                if not os.path.isdir(app.config['UPLOAD_FOLDER']):
                    os.makedirs(app.config['UPLOAD_FOLDER'])
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                return redirect(url_for('uploadFile', filename=filename))
        return '''
        <!doctype html>
        <form method=post enctype=multipart/form-data>
          <input type=file name=file>
          <input type=submit value=Upload>
        </form>
        '''

    @sio.on('message', namespace='/nddav')
    def parsingMessage(sid, msg):
        # if registry:
        registry.parsingMessage(msg)

    @sio.on('disconnect', namespace='/nddav')
    def onDisconnect(sid):
        print ('\n\n!!!!!!!!! socketIO disconnected !!!!!!!!\n\n', sid)

    def show(self):
        # credit for this code goes to the higlass-python team: https://github.com/higlass/higlass-python
        for puid in list(self.processes.keys()):
            self.processes[puid].terminate()
            del self.processes[puid]

        uuid = slugid.nice()

        target = partial(eventlet.wsgi.server, sock=eventlet.listen(('localhost', self.port)), site=fApp)

        self.processes[uuid] = mp.Process(target=target)#self.startServer, args=(q,))
        self.processes[uuid].start()

        #eventlet.wsgi.server(eventlet.listen(('localhost', self.port)), fApp)

        self.connected = False
        while not self.connected:
            try:
                url = "http://{}:{}/".format('localhost', self.port)
                r = requests.head(url)
                if r.ok:
                    self.connected = True
            except requests.ConnectionError:
                time.sleep(0.2)