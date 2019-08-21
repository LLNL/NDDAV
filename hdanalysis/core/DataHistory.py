'''
Store the references to the dependent data information for a given dataProxy

'''

class DataHistory(object):
    def __init__(self, proxy):
        self.proxy = proxy
        self.history = dict()
        self.updateDataRef()

    def updateDataRef(self):
        self.history[self.proxy.type] = self.proxy.getData()

    def updateHistory(self, historyObj):
        for key in historyObj.history:
            self.history[key] = historyObj.history[key]

    @staticmethod
    def checkHistory(*args):
        '''
            check whether all data proxies in arg list have conflicting histories
        '''
        historySummary = dict()
        # print "Existing keys for data history: ", historySummary.keys()
        # print "        History Summary = ", historySummary.keys()
        for proxy in args:
            # print "                  Proxy = ", proxy.getData()
            if not proxy.valid():
                print ("DataHistory: checkHistory  proxy is invalid")
                return False

            # print "proxy keys = ", proxy.history.history.keys()

            for key in proxy.history.history:
                if key in historySummary:
                    # print "k1: ", key
                    # print "k2: ", historySummary.keys()
                    # print key, proxy.history.history[key]
                    if proxy.history.history[key] is not historySummary[key]:
                        print ("DataHistory:checkHistory  history disagree")
                        return False
                else:
                    historySummary[key] = proxy.history.history[key]
        # print "historySummary:",  historySummary
        return True
