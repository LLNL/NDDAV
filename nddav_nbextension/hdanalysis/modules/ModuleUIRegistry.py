from __future__ import print_function
from . import *
import importlib
import json
from threading import Timer
import sys
import os
from hdff import *

'''
  store the map between server module and the corresponding UI in javascript
  uid -> obj
  output -> (uid, type)
'''

class ModuleUIRegistry:
    def __init__(self, sio):
        ###### for communication with python modules #######
        self.uid2Module = dict()
        self.signal2uid = dict()
        self.sio = sio
        ####################################################

        #### for direct communication with Javascript ######
        self.data2ID = dict()
        self.data = dict()
        ####################################################

        self.initParams={}
        self.afterInitilizationCallback = None

        self.signalObjectList = []
        self.namespace = "/nddav"
        self.context = DataContext()
        ###### manage multiple context #####

    def clear(self):
        if len(self.uid2Module):
            self.__init__(self.sio)

    def setArgs(self, args):
        # print "moduleUI setArgs", args
        if args.data:
            self.initParams['FilterModule']={"filename":args.data,'function':args.function}
        if args.graph:
            self.initParams['NeighborhoodModule']={"neigh":args.graph}

    def setAfterInitilizationCallback(self, func):
        #print("########## set after initilization callback")
        self.afterInitilizationCallback = func

    def parsingMessage(self, msg):
        #print "This part defines how the messages got sent"

        #print("####### parsingMessage #################### MSG.KEYS", msg.keys())
        uid = msg['uid']
        msgType = msg['type'] # registerViewUpdate, callModule, addModule
        if msgType == 'callModule':
            function = msg['function']
            parameter = msg['parameter']
            #print("uid: ", uid, "function: ", function, "parameter: ", parameter)
            self.callModule(uid, function, parameter)
        elif msgType == 'addModule':
            moduleName = msg['moduleName']
            listOfSignals = msg['listOfSignals']
            self.addModule(uid, moduleName, listOfSignals)
        elif msgType == 'registerSignal':
            #print('registerSignal')
            signalName = msg['signal']
            self.registerSignal(uid, signalName)
        elif msgType == 'setSignal':
            #print('setSignal')
            signalName = msg['signal']
            value = msg['value']
            self.setSignal(uid, signalName, value)
        elif msgType == 'subscribeData':
            #print('subscribeData')
            self.subscribeData(msg['name'], uid)
        elif msgType == 'initialised':
            #print('initialised')
            if self.afterInitilizationCallback:
                #print("########## trigger after initilization callback")
                self.afterInitilizationCallback();

    # creates and adds a module given a module type
    def addPurePythonModule(self, module_type):
        # the reference is return for python script to access
        return self.context.addModule(module_type)

    # adds a pre-created module object
    def addPurePythonModuleObject(self, module):
        module._setContext(self.context)
        return self.context.addModuleObject(module)

    def addModule(self, uid, moduleName, listOfSignals):
        #print ('        addModule => ', moduleName, uid, listOfSignals)
        if uid in self.uid2Module:
            print ('       module already exist, reconnect')
            return

        # changed from original NDDAV repo
        m1 = importlib.import_module("."+moduleName, "nddav_nbextension.hdanalysis.modules")

        module = getattr(
                 m1,
                 moduleName)
        #### do not track signal on this module #####
        if uid == -1:
            self.context.addModule(module)
        else:
            if moduleName in self.initParams.keys():
                # print ("######## moduleName ", moduleName, self.initParams[moduleName])
                self.uid2Module[uid] = self.context.addModule(module, **self.initParams[moduleName])
            else:
                self.uid2Module[uid] = self.context.addModule(module)
            # print '           -----', self.uid2Module.keys()
            # print '           -----', self.mainModule._children

            for signal in listOfSignals:
                self.registerSignal(uid, signal)
            self.numModules = self.numModules - 1
            #check all the module

        # adds 
        if self.numModules == 0 and self.hasModule:
            if type(self.moduleData) == str:
                ext = splitext(self.moduleData)[1]
                if ext == ".hdff":
                    m1 = importlib.import_module(".HDFileModule", "nddav_nbextension.hdanalysis.modules")
                    mt = getattr(m1, "HDFileModule")
                else:
                    m1 = importlib.import_module(".DataModule", "nddav_nbextension.hdanalysis.modules")
                    mt = getattr(m1, "DataModule")
                
                m = self.addPurePythonModule(mt)

                if ext == ".hdff":
                    m.load(filename=self.moduleData, isIncludeFunctionIndexInfo=False, cube_dim=2)
                else:
                    m.loadFile(filename=self.moduleData)
            elif type(self.moduleData) is np.ndarray:
                m1 = importlib.import_module(".DataModule", "nddav_nbextension.hdanalysis.modules")
                mt = getattr(m1, "DataModule")
                m = self.addPurePythonModule(mt)
                m.loadData2(data=self.moduleData)
            elif type(self.moduleData) is type(DataBlockHandle()):
                m1 = importlib.import_module(".HDFileModule", "nddav_nbextension.hdanalysis.modules")
                mt = getattr(m1, "HDFileModule")
                m = self.addPurePythonModule(mt)
                m.insertData(handle=self.moduleData)
            else:
                m1 = importlib.import_module(".HDFileModule", "nddav_nbextension.hdanalysis.modules")
                m1 = getattr(m1, "HDFileModule")

                m2 = importlib.import_module(".DataModule", "nddav_nbextension.hdanalysis.modules")
                m2 = getattr(m2, "DataModule")

                if type(self.moduleData) is m1:
                    m = self.addPurePythonModuleObject(self.moduleData)
                    m.updateOutputPorts()
                    m.load(m.filename)


            

    ############## direct data communication without modules ###########
    def setData(self, name, data, hasModule, moduleData):
        self.hasModule = False
        if hasModule:
            self.hasModule = hasModule
            self.moduleData = moduleData

        self.data[name] = data
        self.numModules = 0
        for row in range(0,len(data['column'])):
            self.numModules = self.numModules + len(data['column'][row]['row'])

        #propagate data update
        if name in self.data2ID.keys():
            for id in self.data2ID[name]:
                mappedData = dataMapper.Py2Js(data)
                if mappedData:
                    msg = dict()
                    msg['type'] = "data"
                    msg['name'] = name
                    msg['data'] = mappedData
                    self.sendToClient(id, msg)

    def subscribeData(self, name, uid):
        if name in self.data2ID.keys():
            self.data2ID[name].add(uid)
        else:
            self.data2ID[name] = set()
            self.data2ID[name].add(uid)

        #tigger data update if the subscribed data already exist
        # print "subscribeData:", self.data.keys()
        if name in self.data.keys():
            self.sendDataToClient(name, self.data[name], uid)

    def sendDataToClient(self, name, data, uid):
        #print("data type: ", type(data))
        mappedData = dataMapper.Py2Js(data)
        #print ("send to client:", data, " => ", mappedData)
        if mappedData:
            msg = dict()
            msg['type'] = "data"
            msg['name'] = name
            msg['data'] = mappedData
            self.sendToClient(uid, msg)

    #####################################################################
    # allow data to be send to client side when the module is triggered in the server
    def registerSignal(self, uid, signal):
        #print ("########## Signal  ##############", signal)
        # print "############# registerSingal ###############"
        if signal not in self.signal2uid:
            #print ("########## Register  ##############", signal)
            self.signal2uid[signal] = set()
        self.signal2uid[signal].add(uid)
        sObject = signalObject(uid, signal, self.sio, self.namespace)
        self.signalObjectList.append(sObject)
        # print uid
        # getattr(self.mainModule, signal).changedSignal.connect(self.parseSignal)
        # print "a = ", self.uid2Module[uid]
        # print "b = ", signal
        # print "c = ", sObject
        getattr(self.uid2Module[uid], signal).changedSignal.connect(sObject)
        # automatically trigger
        self.getSignal(uid, signal)

    def setSignal(self, uid, signal, value):
        # print uid
        getattr(self.uid2Module[uid], signal).set(dataMapper.Js2Py(value))

    def getSignal(self, uid, signal):
        if getattr(self.uid2Module[uid], signal):
            #print ("=============== Get Signal ==================")
            data = None
            #print(self.uid2Module[uid])
            #print(signal)
            if isinstance(getattr(self.uid2Module[uid], signal), SharedValueProxy):
                data = getattr(self.uid2Module[uid], signal).get()
            else:
                data = getattr(self.uid2Module[uid], signal).getData()
            # print "###### signal type:", type(data)
            ### !!!! if data: will not work for HDData object !!!
            if data is not None:
                mappedData = dataMapper.Py2Js(data)
                #print("===== mapped data =====", mappedData)
                # if mappedData != []:
                msg = dict()
                msg['type'] = "signalCallback"
                msg['signal'] = signal
                msg['data'] = mappedData
                # print msg
                self.sendToClient(uid, msg)
                # print "###### get signal<",signal,"> #######"
                # print mappedData

    def getModule(self, moduleName):
        for key in self.uid2Module:
            # if type(self.uid2Module[key]) == typeName:
            # print(type(self.uid2Module[key]))
            if isinstance(self.uid2Module[key], moduleName):
                return self.uid2Module[key]

    def callModule(self, uid, function, paraDict):

        ########### This function is executed every time when persistence changes / spine updates

        #print("============================== Call:", function)
        # print "Call:", function, "with:", paraDict
        returnVal = None

        # try:
        func = getattr(self.uid2Module[uid],function)
        ##print "func ======>",func

        if paraDict == {}:
                returnVal = func()
        else:
                returnVal = func(**paraDict)
        # except:
        #print("returnVal:", returnVal)
        # print self.uid2Module.keys()
        # print "####### Can't call ", function, self.uid2Module[uid], uid, " ########"

        ##### return if the function have a return value ####
        if returnVal:
            msg = dict()
            msg['type'] = "functionReturn"
            msg['function'] = function
            msg['data'] = returnVal
            # msg['data'] = dataMapper.Py2Js(returnVal)
            self.sendToClient(uid, msg)

    def sendToClient(self, uid, json):
        # emit(uid, json, namespace = self.namespace, broadcast=True)
        #print(self.signal2uid)
        #print(self.uid2Module)
        #print("\nuid: ", uid)
        self.sio.emit(uid, json, namespace = self.namespace)
        # convert returnVal to json

class signalObject:
    def __init__(self, uid, signal, sio, namespace):
        self.uid = uid
        self.signal = signal
        self.sio = sio
        self.namespace = namespace

    def __call__(self, data):
        #print("========== signalObject_call =============")

        msg = dict()
        msg['type'] = "signalCallback"
        msg['signal'] = self.signal
        msg['data'] = dataMapper.Py2Js(data)

        #print ("############ callback data ##############", type(data) )#, msg['data'], self.signal, self.uid
        #print ("signal = ", self.signal, self.uid, msg['data'])
        self.sio.emit(self.uid, msg, namespace = self.namespace, broadcast=False)
        # emit(self.uid, msg, namespace = self.namespace)
        # emit(self.uid, msg, namespace = self.namespace, broadcast=True)
        # print "---- broadcast----"

'''
    convert the data between Javascript and Python
'''
class dataMapper:
    @staticmethod
    def Js2Py(data):
        #convert js array to numpy array
        if isinstance(data, list):
            return np.array(data)
        else:
            return data
    @staticmethod
    def Py2Js(data):
        returnData = dict()
        ############ ExtremumGraph #############
        if isinstance(data, ExtremumGraph):
            #print("====================== ExtremumGraph")
            returnData["persistence"] = data.persistences()[0:20].tolist()
            returnData["variation"] = data.variations()[0:20].tolist()

        elif isinstance(data, ExtremumGraphCmp):
            #print("====================== ExtremumGraphCmp")
            returnData["persistence"] = data.persistences().tolist()
            returnData["variation"] = data.variations().tolist()

        ############ Matrix #############
        elif isinstance(data, Matrix):
            #print("====================== Matrix")
            returnData["mat"] = data.getMatrix().tolist()
            if isinstance(data, ProjMatrix):
                returnData["type"] = data.getProjMatrixType()
        elif isinstance(data, MatrixList):
            #print("====================== MatrixList")
            returnData["matList"] = [mat.tolist() for mat in data.getMatrixList()]

        ############ HDDate #############
        elif isinstance(data, HDData):
            #print ("============ py2js HDData =========== ")
            ############ HDSegmentation #############
            if isinstance(data, HDSegmentation):
                returnData['data'] = [ int(data[i][0]) for i in range(data.shape[0]) ]
                returnData['method'] = data.getMethod()
            ############ HDFunction #############
            elif isinstance(data, HDFunction):
                returnData["data"] = np.transpose(data.asArray()).tolist()
                returnData["domainNames"] = data.domainNames;
                returnData["rangeNames"] = data.rangeNames;
            ############ HDEmbedding #############
            elif isinstance(data, HDEmbedding):
                # print "####### HD embedding ########", HDEmbedding
                returnData["data"] = np.transpose(data.asArray()).tolist()
                returnData['method'] = data.getMethod()
                # returnData["names"] = data.names()
            else:
                # print "########## HDData ############", data.asArray()
                returnData["data"] = np.transpose(data.asArray()).tolist()
                returnData["names"] = data.names()
                # print returnData


        elif isinstance(data, GlobalSummary):
            #print("====================== GlobalSummary")
            # print "@@@@@@@@ array signal @@@@@@@@\n", data
            returnData['comb'] = data.getComb()
            returnData['range'] = data.getrange()
            returnData['data'] = data.tolist()

        ############ array #############
        elif isinstance(data, np.ndarray):
            # print ("============ py2js ndarray =========== ")

            # print "@@@@@@@@ array signal @@@@@@@@\n", data
            returnData['data'] = data.tolist()

        ########### all others ############
        else:
            #print("====================== other")
            returnData["data"] = data

        return returnData
