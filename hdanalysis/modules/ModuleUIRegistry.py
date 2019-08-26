from __future__ import print_function
from . import *
import importlib
import json
from threading import Timer

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
        print("########## set after initilization callback")
        self.afterInitilizationCallback = func

    def parsingMessage(self, msg):
        #print "This part defines how the messages got sent"

        # print "####### parsingMessage #################### MSG.KEYS", msg.keys()
        uid = msg['uid']
        msgType = msg['type'] # registerViewUpdate, callModule, addModule
        if msgType == 'callModule':
            function = msg['function']
            parameter = msg['parameter']
            self.callModule(uid, function, parameter)
        elif msgType == 'addModule':
            moduleName = msg['moduleName']
            listOfSignals = msg['listOfSignals']
            self.addModule(uid, moduleName, listOfSignals)
        elif msgType == 'registerSignal':
            signalName = msg['signal']
            self.registerSignal(uid, signalName)
        elif msgType == 'setSignal':
            signalName = msg['signal']
            value = msg['value']
            self.setSignal(uid, signalName, value)
        elif msgType == 'subscribeData':
            self.subscribeData(msg['name'], uid)
        elif msgType == 'initialised':
            if self.afterInitilizationCallback:
                print("########## trigger after initilization callback")
                self.afterInitilizationCallback();

    def addPurePythonModule(self, module_type):
        # the reference is return for python script to access
        return self.context.addModule(module_type)

    def addModule(self, uid, moduleName, listOfSignals):
        print ('        addModule => ', moduleName, uid, listOfSignals)
        if uid in self.uid2Module:
            print ('       module already exist, reconnect')
            return

        module = getattr(
                 importlib.import_module("hdanalysis.modules."+moduleName),
                 moduleName)
        #### do not track signal on this module #####
        if uid == -1:
            self.context.addModule(module)
        else:
            if moduleName in self.initParams.keys():
                print ("######## moduleName ", moduleName, self.initParams[moduleName])
                self.uid2Module[uid] = self.context.addModule(module, **self.initParams[moduleName])
            else:
                self.uid2Module[uid] = self.context.addModule(module)
            # print '           -----', self.uid2Module.keys()
            # print '           -----', self.mainModule._children

            for signal in listOfSignals:
                self.registerSignal(uid, signal)
            #check all the module

    ############## direct data communication without modules ###########
    def setData(self, name, data):
        self.data[name] = data
        print ("setData in M_UI_Reg ", name, data)
        #propagate data update
        if name in self.data2ID.keys():
            for id in self.data2ID[name]:
                print ("setData:", name, id)
                mappedData = dataMapper.Py2Js(data)
                if mappedData:
                    msg = dict()
                    msg['type'] = "data"
                    msg['name'] = name
                    msg['data'] = mappedData
                    self.sendToClient(id, msg)

    def subscribeData(self, name, uid):
        # print "subscribeData:", name, uid
        if name in self.data2ID.keys():
            self.data2ID[name].add(uid)
        else:
            self.data2ID[name] = set()
            self.data2ID[name].add(uid)

        #tigger data update if the subscribed data already exist
        # print "subscribeData:", self.data.keys()
        if name in self.data.keys():
            # print ("send to client ", self.data[name], uid)
            self.sendDataToClient(name, self.data[name], uid)

    def sendDataToClient(self, name, data, uid):
        mappedData = dataMapper.Py2Js(data)
        print ("send to client:", data, " => ", mappedData)
        if mappedData:
            msg = dict()
            msg['type'] = "data"
            msg['name'] = name
            msg['data'] = mappedData
            self.sendToClient(uid, msg)

    #####################################################################
    # allow data to be send to client side when the module is triggered in the server
    def registerSignal(self, uid, signal):
        print ("########## Signal  ##############", signal)
        # print "############# registerSingal ###############"
        if signal not in self.signal2uid:
            print ("########## Register  ##############", signal)
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
            print ("=============== Get Signal ==================")
            data = None
            if isinstance(getattr(self.uid2Module[uid], signal), SharedValueProxy):
                data = getattr(self.uid2Module[uid], signal).get()
            else:
                data = getattr(self.uid2Module[uid], signal).getData()

            # print "###### signal type:", type(data)
            ### !!!! if data: will not work for HDData object !!!
            if data is not None:
                mappedData = dataMapper.Py2Js(data)
                # print "===== mapped data =====", mappedData
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

        # print "============================== Call:", function
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
        # print "returnVal:", returnVal
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
        self.sio.emit(uid, json, namespace = self.namespace)
        # convert returnVal to json

class signalObject:
    def __init__(self, uid, signal, sio, namespace):
        self.uid = uid
        self.signal = signal
        self.sio = sio
        self.namespace = namespace

    def __call__(self, data):
        # print "========== signalObject_call ============="

        msg = dict()
        msg['type'] = "signalCallback"
        msg['signal'] = self.signal
        msg['data'] = dataMapper.Py2Js(data)

        print ("############ callback data ##############", type(data) )#, msg['data'], self.signal, self.uid
        # print ("signal = ", self.signal, self.uid, msg['data'])
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
            # print ("====================== ExtremumGraph")
            returnData["persistence"] = data.persistences()[0:20].tolist()
            returnData["variation"] = data.variations()[0:20].tolist()

        elif isinstance(data, ExtremumGraphCmp):
            returnData["persistence"] = data.persistences().tolist()
            returnData["variation"] = data.variations().tolist()

        ############ Matrix #############
        elif isinstance(data, Matrix):
            returnData["mat"] = data.getMatrix().tolist()
            if isinstance(data, ProjMatrix):
                returnData["type"] = data.getProjMatrixType()
        elif isinstance(data, MatrixList):
            returnData["matList"] = [mat.tolist() for mat in data.getMatrixList()]

        ############ HDDate #############
        elif isinstance(data, HDData):
            # print ("============ py2js HDData =========== ")
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
            returnData["data"] = data

        return returnData
