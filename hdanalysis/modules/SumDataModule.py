from .Module import *

import itertools as it

import math

class SumDataModule(Module):

    def __init__(self,bin=None):

        super(SumDataModule,self).__init__(bin)

        self.makeInputPort("EGgraph", ExtremumGraph)

        self.makeOutputPort("sumdata", GlobalSummary)

        self.makeSharedValue("subselection",np.array([-1],dtype=np.int32))

        self.link(self.EGgraph, self.sumdata, self.setSum)

        ####### force min max range for each dimension ########
        # self.makeSharedValue("globalMinMax", np.array([-1], dtype=(np.float32, np.float32)))
        self.makeSharedValue("globalMinMax", dict)
        # Global Hist for all data points

    def setSum(self, eg):

        attrs = eg.getAttrs()

        # bins = len(eg.get2Dhist(attrs[0], attrs[1]))
        bins = len(eg.gethists(attrs[0:2]))

        res = int(math.sqrt(bins))

        num = int(len(attrs)*(len(attrs)-1)/2+len(attrs))

        output = np.zeros((num, res * res), dtype=np.int32)

        mymap = {}

        # Adding 2D histograms
        ind = 0
        for i in range(len(attrs)):
            for j in range(i+1, len(attrs)):
                attr1, attr2 = attrs[i], attrs[j]
                mymap[attr1+"$"+attr2] = ind
                output[ind,:] = eg.gethists([attr1,attr2])
                ind+=1

        # Adding 1D histograms
        for i in range(len(attrs)):
            attr= attrs[i]
            mymap[attr] = ind
            output[ind,0:res] = eg.gethists([attr])
            ind+=1

        range0 = eg.getRange(attrs[-1])

        print("output = ", output.shape)

        sumobj = output.view(GlobalSummary)

        for i in attrs:
            cur_range = eg.getRange(i)[0]
            all_r= list(np.linspace(cur_range[0], cur_range[1],res))
            sumobj.addRange(i, all_r)
            sumobj.addName(i)

        for j in mymap:
            sumobj.addComb(j, mymap[j])

        return sumobj
