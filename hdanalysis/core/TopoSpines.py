import pyclipper
import numpy as np
from scipy import linalg
from graphviz import Graph
import math
import random
from sklearn import manifold, decomposition
# import networkx as nx
from math import pow

class TopoSpines:
    """
    Generate topoSpine drawing description from ExtremaGraph, maintain the graph layout context
    """
    def __init__(self, eg, rangeNames, domainNames):
        # object.__init__(self)
        self.previousPos = dict() # point index to pos
        self.pos = dict()
        self.eg = eg
        # self.data = data #data is HDFunction
        # self.f = self.data.asArray()
        self.fname = rangeNames[-1] #self.data.dtype.names[-1]
        # print "\n------------>", self.fname, rangeNames
        self.rangeNames = rangeNames
        self.dim = len(domainNames)

        self.previousNodeSize = -1
        # self.scale = 1.0

        ### smallest unit in the clipper mapped (integer) space
        self.tessResolution = 60000000
        self.outputMesh = False

    def update(self, graph, f_low, f_high, seg = None):
        self.graph = graph
        self.low = f_low
        self.high = f_high

        ## once the graph is updated, update the node and links
        self.f = dict()
        self.loc = dict()
        self.extremaSet = set()
        self.saddleSet = set()
        for s in self.graph.keys():
            self.saddleSet.add(s)
            for ext in self.graph[s]:
                self.extremaSet.add(ext)

        #! This might be changed to use distance instead of function value

        for s in self.saddleSet:
            self.f[s] = self.eg.criticalPointF(s)
            self.loc[s] = self.eg.criticalPointLocation(s)

        for ext in self.extremaSet:
            self.f[ext] = self.eg.criticalPointF(ext)
            self.loc[ext] = self.eg.criticalPointLocation(ext)

            # print("ext:", ext, "loc:", self.loc[ext], "value:", self.f[ext])
        # crash()


        # print("function value dict:", self.f)
        # print("extremaSet:", self.extremaSet)
        # print("saddleSet:", self.saddleSet)

        ## if have access to segments
        if seg:
            self.seg = seg
            self.segSets = dict()
            for key in self.seg.keys():
                self.segSets[key] = set(self.seg[key])

        # self.extremaContourLookup = dict()

    def normalize(self, v):
        norm=np.linalg.norm(v)
        if norm==0:
           return v
        return v/norm

    def layout(self, layoutType = 'graph'):

        ###### need domain information for generating layout using DR
        # domain = self.f[:,:-1]

        if layoutType == 'graph':
            # g = nx.Graph()
            g = Graph('ER',engine='neato')

            i = 0
            index_map = dict()
            inverse_index_map = dict()
            # for ext in self.seg.keys():
            for s in self.graph.keys():

                for ext in self.graph[s]:
                    index_map[ext] = i
                    inverse_index_map[i] = ext

                    if ext in self.previousPos.keys():
                        ppos = self.previousPos[ext]
                        # print 'previous position is provided for:', ext, ppos[0], ppos[1]
                        g.node('%d' % ext, pos="%f,%f" % (ppos[0], ppos[1]))
                    else:
                        # print "\n\n No previousPos provided for:", ext, '\n\n'
                        g.node('%d' % ext)

                    i += 1


            for s in self.graph.keys():
                index_map[s] = i
                inverse_index_map[i] = s
                if s in self.previousPos.keys():
                    ppos = self.previousPos[s]
                    # print 'previous position is provided for:', s, ppos[0], ppos[1]
                    g.node('%d' % s, pos="%f,%f" % (ppos[0], ppos[1]))
                else:
                    # print "\n\n No previousPos provided for:", ext, '\n\n'
                    g.node('%d' % s)
                i += 1

            for s in self.graph.keys():
                for ext in self.graph[s]:

                    g.edge(str(s),str(ext),len=str(linalg.norm(self.loc[s] - self.loc[ext])))
                    # g.add_edge(index_map[s], index_map[ext], weight=linalg.norm(f[s,:-1] - f[ext,:-1]))

            self.currentNodeSize = len(index_map)

            if self.currentNodeSize == self.previousNodeSize:
                return

            self.previousNodeSize = self.currentNodeSize
            ##print "============== Render Spine =============="

            g.format = 'plain'
            path = g.render('spine')
            input = open('spine.plain')

            for l in input.readlines():
                l = l.split()
                # print l

                if l[0] == 'node':
                    self.pos[int(l[1])] = [float(l[2]),float(l[3])]
                    #give position to all children
                    #only if l[1] is extrema
                    #init the position all the point to the extrema pos
                    ## FIXME update children extrema to the parent location
                    # print("extremaSet = ", self.extremaSet)
                    #if int(l[1]) in self.extremaSet:
                    #     self.pos.update(dict.fromkeys(self.extremaSet[int(l[1])], [float(l[2]),float(l[3])]))

        elif layoutType == 'PCA':
            if recomputePCA:
                self.pca = decomposition.PCA(n_components=2)
                self.pca.fit(domain)
            pos2D = self.pca.transform(domain).tolist()

            for index, val in enumerate(pos2D):
                self.pos[nodeIndicesList[index]] = val

        elif layoutType == 'MDS':
            mds = manifold.MDS(n_components=2, max_iter=100, n_init=1)
            pos2D = mds.fit_transform(domain).tolist()

            for index, val in enumerate(pos2D):
                self.pos[nodeIndicesList[index]] = val

        elif layoutType == 'tSNE':
            tsne = manifold.TSNE(n_components=2, init='pca', random_state=0)
            pos2D = tsne.fit_transform(domain).tolist()
            for index, val in enumerate(pos2D):
                self.pos[nodeIndicesList[index]] = val

        else: #PCA is the default
            pca = decomposition.PCA(n_components=2)
            pos2D = pca.fit_transform(domain).tolist()
            for index, val in enumerate(pos2D):
                self.pos[nodeIndicesList[index]] = val

        #store position
        # print self.pos
        # print "compare self.pos vs self.previousPos"
        # for p in self.previousPos.keys():
            # if self.previousPos[p] != self.pos[p]:
                # print p, self.previousPos[p], self.pos[p]

        self.previousPos = self.pos

        #if only layout one point clear the position cache
        if len(self.graph.keys())<=1:
            self.previousPos = dict()
        # print self.previousPos

    #### map contour size from point count to radius for the spine ####
    def mapContourSize(self, size):
        return pow(float(size), 2.0/float(self.dim))


    def generateSpine(self, contour_count, **kwords):
        pos = self.pos
        low = self.low
        high = self.high

        spine = dict()
        nodes = dict()

        self.contours = dict()
        self.extremaContourLookup = dict()
        edges = []

        levels = [float(low + i*(high-low)/(contour_count)) for i in range(0,contour_count)]

        saddleValSet = set()

        for s in self.saddleSet:
            saddleValSet.add(float(self.f[s]))
        saddleValues = list(saddleValSet)

        # levels.sort()
        levelDelta = (max(levels)-min(levels))/contour_count
        #reduce the similariy between the contour value
        # filteredSaddleValues = []
        for sval in levels:
            #init diff
            diff = (max(levels)-min(levels))
            for l in saddleValues:
                if diff > abs(sval-l):
                    diff = abs(sval-l)
            if diff>levelDelta:
                saddleValues.append(sval)

        # levels = levels + filteredSaddleValues
        # levels = levels + saddleValues
        levels = saddleValues
        levels.sort()

        spine['levels'] = levels

        # print "LEVELS + ", levels
        index_map = dict()

        count = 0

        ### add extrema ####
        for ext in self.extremaSet:
            sizes = [self.eg.segmentSize(ext,l,**kwords) for l in levels]
            # print sizes
            sizes = [self.mapContourSize(x) for x in sizes]
            nodes[count] = {'id' : ext, 'pos' : pos[ext], 'sizes' : sizes, 'f':self.f[ext]}

            index_map[ext] = count
            count += 1

        ### add saddle ####
        for s in self.graph.keys():
            sizes = [0] * len(levels)
            for i,l in enumerate(levels):
                for ext in self.graph[s]:
                    # sizes[i] = self.eg.segmentSize(s,l,**kwords)
                    saddleSize = self.mapContourSize(self.eg.segmentSize(ext,l,**kwords)) - self.mapContourSize(self.eg.segmentSize(ext,float(self.f[s]),**kwords))
                    # print saddleSize, self.eg.segmentSize(ext,float(self.f[s]),**kwords)
                    if saddleSize>0:
                        if saddleSize>sizes[i]:
                            sizes[i] = saddleSize
                        # sizes[i] += saddleSize
                # sizes[i] /= len(self.graph[s])

            # sizes = [self.mapContourSize(x) for x in sizes]
            # print "contourSize:",sizes

            nodes[count] = {'id' : s, 'pos' : pos[s], 'sizes' : sizes, 'f':self.f[s]}

            index_map[s] = count
            count += 1

        for s in self.graph.keys():
            for ext in self.graph[s]:
                edges.append([index_map[s], index_map[ext]])

        spine['nodes'] = nodes
        spine['edges'] = edges
        # print spine
        # print spine
        ########################## generate Contour #########################
        funcValues = levels

        maxContours = []
        for node in nodes.values():
            # print node['sizes']
            maxContours.append(max(node['sizes']))
        self.maxContourSize = max(maxContours)
        # print "maxContourSize:", self.maxContourSize

        if len(edges) > 0:
            for edge in edges:

                index1 = int(edge[0])
                index2 = int(edge[1])

                # print "index1", index1, "index2", index2

                # saddleFlag = min(nodes[index1]['sizes'])
                # print "XXXXXXXX", nodes[index1]['f'], nodes[index2]['f'], nodes[index2]['sizes']
                if nodes[index1]['f'] < nodes[index2]['f']:
                    saddle = nodes[index1]
                    extrema = nodes[index2]
                else:
                    extrema = nodes[index1]
                    saddle = nodes[index2]

                # Some problem here?
                self.buildContours(extrema, saddle, funcValues)
                # print extrema['id'], saddle['id']

        else: #if no edge exist, only a single peak
            for index, funcValue in enumerate(funcValues):
                radius = nodes[0]['sizes'][index]
                self.buildPeakContour(funcValue, nodes[0], radius)

        #compute the path for layout computation of the comparison function
        self.computePerExtremaContour()

        contourPath = dict()
        # print "contour key:", self.contours.keys()
        pathValX = []
        pathValY = []
        for funcValue in funcValues:
            cpr = self.contours[float(funcValue)]
            paths = pyclipper.scale_from_clipper(cpr.Execute(pyclipper.CT_UNION,
                        pyclipper.PFT_NONZERO, pyclipper.PFT_NONZERO))
            for path in paths:
                pathValX = pathValX + [point[0] for point in path]
                pathValY = pathValY + [point[1] for point in path]

            contourPath[funcValue] = paths

        # print pathValX, pathValY
        pathXmin = min(pathValX)
        pathXmax = max(pathValX)
        pathYmin = min(pathValY)
        pathYmax = max(pathValY)
        pathXRange = pathXmax-pathXmin
        pathYRange = pathYmax-pathYmin
        xScale = 1500.0/pathXRange
        yScale = xScale
        pathXRange = pathXRange*xScale
        pathYRange = pathYRange*xScale
        # print "pathXRange:", pathXRange, "   pathYRange", pathYRange


        if self.outputMesh:
            from wand.image import Image
            from wand.drawing import Drawing
            from wand.color import Color
            import math

            with Drawing() as draw:
                # draw.stroke_width = 2
                # draw.stroke_color = Color('black')
                draw.fill_color = Color('white')
                # points = [(25, 25), (75, 50), (25, 75)]
                maxVal = max(contourPath.keys())
                valList = list(contourPath.keys())
                valList.sort()
                # print valList
                for val in valList:
                    # print val, maxVal
                    for path in contourPath[val]:
                        # for path in paths:
                            draw.fill_color = Color("rgb("+ str(int(val/maxVal*255.0)) +","+ str(int(val/maxVal*255.0)) +","+ str(int(val/maxVal*255.0)) +")")
                            mappedPath = [( (point[0]-pathXmin)*xScale, (point[1]-pathYmin)*yScale) for point in path]
                            # print mappedPath
                            draw.polygon(mappedPath)

                with Image(width=int(math.floor(pathXRange+1.0)), height=int(math.floor(pathYRange+1.0)), background=Color('black')) as image:
                    draw(image)
                    image.format = 'png'
                    image.save(filename='testTerrain.png')

        spine['contour'] = contourPath
        return spine


    def jsonSpine(self, contour_count, **kwords):
        # print '\n\n\n', kwords['layoutType']
        self.layout(kwords['layoutType'])
        self.scale = kwords['scale']
        pos = self.pos
        # f = self.data.asArray()

        spine = self.generateSpine(contour_count, **kwords)

        json = "{\n"
        json += "\t\"fname\":\""+self.fname+"\",\n"
        json += "\t\"rangeNames\":["

        for name in self.rangeNames:
            json += "\""+name+"\","
        json = json[:-1]
        json += "],\n"

        json += "\t\"nodes\":["
        for n in spine['nodes'].values():
            #print n['id']
            json += "\n\t\t{\"functionValue\":%f,\n" % self.f[n['id']]
            json += "\t\t \"contourSize\":" + str(n['sizes']) + ",\n"
            json += "\t\t \"position\":" + str(n['pos']) + ",\n"
            json += "\t\t \"index\":" + str(n['id']) + "\n"
            json += "\t\t},"

        json = json[:-1]
        json += "\n\t],\n"


        json += "\t\"link\":["

        if len(spine['edges'])>0:
            for e in spine['edges']:
                json += "\"%d-%d\", " % (e[0],e[1])

            #this need to be guarded by edge number, otherwise the output json will be incorrect
            json = json[:-2]

        json += "],\n\t\"contourValues\":["
        for l in spine['levels']:
            json += "\"%f\"," % l
        json = json[:-1]

        json += "],\n\t\"contourPath\":{"
        for l in spine['contour'].keys():
            json += "\"%f\": " % l
            json += str(spine['contour'][l])+","
        json = json[:-1]

        json += "}\n"

        json += "}\n"

        # print json
        return json


    ##################### Contour generation #####################
    def generatePolygonCirclePath(self, position, r, extremaIndex, funcValue):
        #number of point used to approximate circle
        x0 = position[0]
        y0 = position[1]
        r = r/float(self.maxContourSize)*self.scale

        items = 20+int(2*3.14*pyclipper.scale_to_clipper(r)/self.tessResolution)
        # print "generatePolygonCircle:", items

        path = []
        for i in range(items):
            x = x0 + r * math.cos(2 * math.pi * i / items)
            y = y0 + r * math.sin(2 * math.pi * i / items)
            path.append( [x,y] )

        path = pyclipper.scale_to_clipper(path)
        return path

    def generateHalfCircle(self, position, r, saddleDir, exPos, funcValue):
        x0 = position[0]
        y0 = position[1]
        r = r/float(self.maxContourSize)*self.scale

        items = 10+int(3.14*pyclipper.scale_to_clipper(r)/self.tessResolution)
        # print "generateHalfCircle:", items

        path = []
        #compute test dirVec
        sDirOrth = np.array([saddleDir[1], -saddleDir[0]])
        exDir = self.normalize(np.array(exPos)-np.array(position))

        if np.dot(sDirOrth, exDir) < 0.0:
            sDirOrth = -sDirOrth

        for i in range(items):
            x = x0 + r * math.cos(2 * math.pi * i / items)
            y = y0 + r * math.sin(2 * math.pi * i / items)
            p2Center = self.normalize(np.array([x,y])-np.array(position))
            if np.dot(sDirOrth, p2Center)>=0.0:
                path.append( [x,y] )

        path = pyclipper.scale_to_clipper(path)
        return path

    def generateQuadConnectingCircles(self, position1, position2, radius1, radius2, extremaIndex, saddleIndex, funcValue):
        radius1 = float(radius1)/float(self.maxContourSize)*self.scale
        radius2 = float(radius2)/float(self.maxContourSize)*self.scale
        # print "position1, position2, radius1, radius2:", position1, position2, radius1, radius2

        pointList = []
        dirVec = [position1[0] - position2[0], position1[1] - position2[1]]
        norm = math.sqrt(dirVec[0] * dirVec[0] + dirVec[1] * dirVec[1])
        dirVecUnit = [dirVec[0] / norm, dirVec[1] / norm]
        orthVecUnit = [dirVecUnit[1], -dirVecUnit[0]]


        #find the other extrema connected to saddle
        ex2Pos = None
        for ex in self.graph[saddleIndex]:
            if ex != extremaIndex:
                #the other extrema
                ex2Pos = self.pos[ex]

        exP = np.array(position1) #extrema
        sP = np.array(position2) #saddle
        ex2P = np.array(ex2Pos)

        #in between direction of the ex-s, ex2-s
        interDir = self.normalize(self.normalize(exP-sP) + self.normalize(ex2P-sP))

        if np.dot(interDir, np.array(orthVecUnit))<0:
            interDir = -interDir

        interDirUnit = interDir.tolist()

        if radius1 == 0:
            pointList.append(position1)
        else:
            pointList.append([position1[0] + radius1 * orthVecUnit[0], position1[1] + radius1 * orthVecUnit[1]])
            pointList.append([position1[0] - radius1 * orthVecUnit[0], position1[1] - radius1 * orthVecUnit[1]])

        if radius2 == 0:
            pointList.append(position2)
        else:
            pointList.append([position2[0] - radius2 * interDirUnit[0], position2[1] - radius2 * interDirUnit[1]])
            pointList.append([position2[0] + radius2 * interDirUnit[0], position2[1] + radius2 * interDirUnit[1]])

        path = []

        for i in range(len(pointList)):
            path.append( [pointList[i][0],pointList[i][1]] )

        path = pyclipper.scale_to_clipper(path)
        return path, interDirUnit

    def buildContours(self, extrema, saddle, contourValues):

        # print "Build Contours???"
        # print extrema, saddle, contourValues

        #FIXME => replace fix delta with relative value
        delta = 0.000000000000000000000001
        for i, contourValue in enumerate(contourValues):
            #only draw contour when its function value is smaller than the function value of the extrema
            if contourValues[i] < extrema['f']:
                if contourValues[i] <= saddle['f'] or abs(contourValues[i] - saddle['f']) < delta:
                    radiusExtrema = extrema['sizes'][i]
                    radiusSaddle = saddle['sizes'][i]
                    self.buildFigureEightContour(contourValue, radiusExtrema,
                            radiusSaddle, extrema, saddle)
                else:
                    # > saddle function value
                    radius = extrema['sizes'][i]
                    # print "Build Contours?!!!      ", contourValue, extrema, radius

                    self.buildPeakContour(contourValue, extrema, radius)

    def tesselateQuad(self, listP):
        #make it a close circle
        listP.append(listP[0])
        path = []
        for i in range(0,len(listP)-1):
            path += self.tesselateLine(listP[i], listP[i+1])

        # print "\ntesselateQuad ============="
        # print startP, endP
        # print path
        # for p in path:
        #     print p[0],',', p[1]

        return path

    def tesselateLine(self, startP, endP, count=15):
        path = []
        #compute the sample density
        dist = np.linalg.norm(np.array(startP)-np.array(endP))
        count = int(dist/self.tessResolution)+2
        # print "tesselateLine:",count

        for i in range(count):
            point = [int(startP[0]) + int(float(i)/float(count-1)*float(endP[0]-startP[0])),
                     int(startP[1]) + int(float(i)/float(count-1)*float(endP[1]-startP[1]))]
            path.append(point)
        return path

    def storePerExtremaContour(self, listOfPath, extrema, funcValue):

        extremaIndex = extrema['id']
        if extremaIndex not in self.extremaContourLookup.keys():
            self.extremaContourLookup[extremaIndex] = dict()

        if funcValue in self.extremaContourLookup[extremaIndex].keys():
            self.extremaContourLookup[extremaIndex][funcValue] += listOfPath
        else:
            self.extremaContourLookup[extremaIndex][funcValue] = listOfPath

    def computePerExtremaContour(self):
        # print "computePerExtremaContour:"
        # print self.extremaContourLookup.keys()
        for extremaIndex in self.extremaContourLookup.keys():
            for funcValue in self.extremaContourLookup[extremaIndex].keys():
                listOfPath = self.extremaContourLookup[extremaIndex][funcValue]
                cpr = pyclipper.Pyclipper()
                for path in listOfPath:
                    if len(path):
                        # print "singlePath:"
                        # for p in path:
                        #     print p[0],',', p[1]
                        # print "\n"
                        cpr.AddPath(path, pyclipper.PT_SUBJECT, True)

                unionPath = pyclipper.scale_from_clipper(cpr.Execute(pyclipper.CT_UNION,
                                    pyclipper.PFT_NONZERO, pyclipper.PFT_NONZERO))

                #store the union of paths
                self.extremaContourLookup[extremaIndex][funcValue] = unionPath[0]

    def buildFigureEightContour(self, funcValue, radius1, radius2, node1, node2):
        # clipper drawing contours
        #node1 is the extrema

        if funcValue not in self.contours.keys():
            # print "contourKeys:", self.contours.keys(), "fValue:", funcValue
            self.contours[float(funcValue)] = pyclipper.Pyclipper()

        cpr  = self.contours[float(funcValue)]
        circle1_path = []
        circle2_path = []
        halfCircle2_path = []

        connection_path, saddleDir  = self.generateQuadConnectingCircles(node1['pos'],
            node2['pos'], radius1, radius2, node1['id'], node2['id'], funcValue)

        cpr.AddPath(connection_path, pyclipper.PT_SUBJECT, True)

        if radius1 != 0:
            circle1_path = self.generatePolygonCirclePath(node1['pos'], radius1, node1['id'], funcValue)
            cpr.AddPath(circle1_path, pyclipper.PT_SUBJECT, True)
        if radius2 !=0:
            #need to pass extrema index even though this is a saddle
            circle2_path = self.generatePolygonCirclePath(node2['pos'], radius2, node1['id'], funcValue)
            cpr.AddPath(circle2_path, pyclipper.PT_SUBJECT, True)
            #compute half circle
            halfCircle2_path = self.generateHalfCircle(node2['pos'], radius2, saddleDir, node1['pos'], funcValue)

        self.storePerExtremaContour([self.tesselateQuad(connection_path), circle1_path, halfCircle2_path], node1, funcValue)

    def buildPeakContour(self, funcValue, node, radius):
        if funcValue not in self.contours.keys():
            # print "contourKeys:", self.contours.keys(), "fValue:", funcValue
            self.contours[float(funcValue)] = pyclipper.Pyclipper()

        cpr = self.contours[float(funcValue)]
        circle_path = self.generatePolygonCirclePath(node['pos'], radius, node['id'], funcValue)
        # print circle_path
        cpr.AddPath(circle_path, pyclipper.PT_SUBJECT, True)

        self.storePerExtremaContour([circle_path], node, funcValue)


    ###################### overlap coloring ######################
    def generateOverlapColoringSpineJSON(self, contour_count, selection, **kwords):

        # print(" Need to Modify this function to use brushed range during query ")

        var=kwords['var'] # self.currentVariation,
        per=kwords['per'] # self.currentPersistence,

        all_segs = self.eg.segmentation(var=var, per=per)

        self.layout(kwords['layoutType'])
        self.scale = kwords['scale']
        pos = self.pos

        brushedrange = {}
        minmax = []
        if 'brushedrange' in kwords:
            brushedrange = kwords['brushedrange']
            # print(brushedrange)
        for k in brushedrange:
            minmax.append(brushedrange[k][0])
            minmax.append(brushedrange[k][1])

        selected_f = []
        original_f = []
        if 'brushed' in kwords and 'original' in kwords:
            selected_f = kwords['brushed']
            original_f = kwords['original']
        # brushed = selected_f,
        # original = original_f

        # print("selected = ", selected_f, " original = ", original_f)
        # The brushedrange here should already be function value

        # f = self.data.asArray()

        spine = self.generateSpine(contour_count, **kwords)

        json = "{\n"
        json += "\t\"fname\":\""+self.fname+"\",\n"
        json += "\t\"rangeNames\":["

        for name in self.rangeNames:
            json += "\""+name+"\","
        json = json[:-1]
        json += "],\n"

        json += "\t\"nodes\":["

        #f = self.f
        for n in spine['nodes'].values():
            json += "\n\t\t{\"functionValue\":%f,\n" % self.f[n['id']]

            #json += "\n\t\t{\"functionValue\":%f,\n" % f[n['id']]
            json += "\t\t \"contourSize\":" + str(n['sizes']) + ",\n"
            json += "\t\t \"position\":" + str(n['pos']) + ",\n"
            json += "\t\t \"index\":" + str(n['id']) + "\n"
            json += "\t\t},"

        json = json[:-1]
        json += "\n\t],\n"


        json += "\t\"link\":["

        if len(spine['edges'])>0:
            for e in spine['edges']:
                json += "\"%d-%d\", " % (e[0],e[1])

            #this need to be guarded by edge number, otherwise the output json will be incorrect
            json = json[:-2]

        json += "],\n\t\"contourValues\":["
        for l in spine['levels']:
            json += "\"%f\"," % l
        json = json[:-1]

        json += "],\n\t\"contourPath\":{"
        for l in spine['contour'].keys():
            json += "\"%f\": " % l
            json += str(spine['contour'][l])+","
        json = json[:-1]

        json += "}\n"

        subselectionSet = set(selection)

        # print("subselectionSet = ", subselectionSet)

        # Compare contour with selection
        # If -1, compare with all
        json += ",\n\t\"contourSeg\":{"
        for l in spine['levels']:

            json += "\"%f\":{" % l

            # print("all extrema = ", self.extremaContourLookup.keys())
            for extrema in self.extremaContourLookup.keys():

                # print("extrema = ", extrema)
                # print("selection = ", selection)



                if len(selection)>1 and selection[0] == extrema:
                    selectionsize = selection[1]
                #selectionsize = selection[1] if selection[0] == extrema else 0

                elif selection[0]==-1:
                    if extrema in all_segs:
                        cur_seg = all_segs[extrema]
                        cur_sel = np.array([cur_seg[0], np.sum(np.array(cur_seg))-cur_seg[0]])
                        selectionsize = cur_sel[1]
                        # print("sel_size = ", selectionsize)
                else:
                    selectionsize = 0

                keys = self.extremaContourLookup[extrema].keys()
                # keys.sort() //py2
                keys = sorted(keys)

                # print('extrema = ', extrema, 'keys = ', keys)
                # print("keys num = ", len(keys))
                prob = []
                if len(selected_f)>0:
                    keyNum = len(keys)
                    bins = int(math.ceil(len(selected_f)/keyNum))
                    # print("bins = ", bins, " key length = ", keyNum)

                    for kk in range(keyNum):
                        sel, ori = 0.0, 0.0
                        for b in range(bins):
                            if (kk*bins+b)<len(selected_f):
                                sel = sel + selected_f[kk*bins+b]
                                ori = ori + original_f[kk*bins+b]
                        # print("sel = ", sel, " ori = ", ori)

                        if ori!= 0:
                            prob.append(sel/ori)
                        else:
                            prob.append(0)

                # print("prob = ", prob)


                for i,f in enumerate(keys):
                    # print("i = ", i, " f = ", f)
                    if f == l:
                        json += "\"%d\":" % extrema
                        # json += "[[1.0,2.0]]"+","
                        json += "{"

                        contourSet = set()
                        sizediff = 0
                        s1 = set(self.eg.segment(extrema, keys[i],**kwords))

                        if i!=len(keys)-1:
                            s2 = set(self.eg.segment(extrema,keys[i+1],**kwords))

                            if len(s1)==len(s2) and len(s1)==1:

                                sizediff = s1.pop()-s2.pop()
                            else:
                                contourSet = s1-s2

                        else:
                            if len(s1) == 1:
                                sizediff = s1.pop()

                            else:
                                contourSet = set(self.eg.segment(extrema,keys[i],**kwords))

                        if sizediff !=0:
                            # Something needs to be changed here for highlighting
                            # print("extrema = ", extrema, " selection0 = ", selection[0])
                            # Encorporate with brushing effect here
                            # i, f in ascending order

                            if extrema == selection[0] or selection[0]==-1:
                                # occupancy = float(sizediff)/(float(selectionsize)+1)
                                # print("sizediff = ", sizediff, " selectionsize = ", selectionsize)
                                occupancy = 1.0 # float(selectionsize)

                                if len(prob)>0:
                                    occupancy = prob[i]# occupancy * prob[i]
                                # print("occupancy = ", occupancy)
                            else:
                                occupancy = 0.0
                            # print("A")
                            # occupancy = float(selectionsize)/float(sizediff)
                        elif len(contourSet):
                            # Need to modify here to get the transparency or color
                            occupancy = float(len(contourSet.intersection(subselectionSet)))/float(len(contourSet))


                        else:#if the range is empty

                            occupancy = 0.0

                        # occupancy = 0.5
                        # print("occupancy = ", occupancy)

                        json += "\"occupancy\":"
                        json += str(occupancy)+','
                        json += "\"path\":"
                        json += str(self.extremaContourLookup[extrema][f])
                        json +="},"


            json = json[:-1]
            json += "},"
        json = json[:-1]
        json += "}\n}\n"

        return json

    #################### Spine Comparison ####################
    def contourPosLookup(self, pIndex, f):
        contourList = None
        nodeIndex = self.seg.keys()+self.graph.keys()
        # print "\n\nnodeIndex:", nodeIndex, self.seg.keys(), self.graph.keys()
        pos = []
        contourList = []
        contour = []
        posIndex = None
        if pIndex in nodeIndex and pIndex in self.pos.keys():
            pos = self.pos[pIndex]
        else:
            for key in self.segSets.keys():
                if pIndex in self.segSets[key]:
                    contourList = self.extremaContourLookup[key]

        if contourList:
            #find the closest contour
            contour = contourList[f] if f in contourList else contourList[min(contourList.keys(), key=lambda k: abs(k-f))]
            posIndex = int((len(contour)-1)*random.random())
            posIndex = len(contour)/2
            pos = contour[posIndex]

        # print "\n########### ERROR: can not locate point in f1 ##############\n"
        return pos, contour, posIndex

    def layoutCmpSkeleton(self, nodes, edges):
        for key in nodes.keys():
            index = nodes[key]['id']
            f1 = self.f[index,-1]
            nodes[key]['pos'], nodes[key]['contourDomain'], nodes[key]['contourIndex'] = self.contourPosLookup(index, f1)
        # return nodes
        return self.forceLayout(nodes, edges)

    def forceLayout(self, nodes, edges):
        n=50
        neighborLookup = dict()
        for edge in edges:
            # 0-saddle, 1-extrema
            if edge[0] in neighborLookup.keys():
                neighborLookup[edge[0]].add(edge[1])
            else:
                neighborLookup[edge[0]] = set([edge[1]])

            if edge[1] in neighborLookup.keys():
                neighborLookup[edge[1]].add(edge[0])
            else:
                neighborLookup[edge[1]] = set([edge[0]])

        for i in range(n):
            #for each node
            # print "-----", i, "-------"
            for index in neighborLookup.keys():
                #compute force per node
                forceDir = np.array([0.0,0.0])
                pos = np.array(nodes[index]['pos'])
                for nindex in neighborLookup[index]:
                    nPos = np.array(nodes[nindex]['pos'])
                    forceDir += nPos - pos
                #compute angle

                forceDir = self.normalize(forceDir)
                contourDomain = nodes[index]['contourDomain']
                contourIndex = nodes[index]['contourIndex']
                # print '\t', "$", contourIndex, forceDir, neighborLookup[index]
                if contourIndex is not None:
                    leftIndex = len(contourDomain)-1 if contourIndex-1<0 else contourIndex-1
                    rightIndex = 0 if contourIndex+1>=len(contourDomain) else contourIndex+1
                    leftDir = self.normalize(np.array(contourDomain[leftIndex]) - np.array(contourDomain[contourIndex]))
                    rightDir = self.normalize(np.array(contourDomain[rightIndex]) - np.array(contourDomain[contourIndex]))
                    # print '\t\t', '(%d)'%index, np.dot(forceDir,leftDir) , np.dot(forceDir,rightDir)

                    if np.dot(forceDir,leftDir) > np.dot(forceDir,rightDir):
                        contourIndex = leftIndex
                    else:
                        contourIndex = rightIndex

                    nodes[index]['contourIndex'] = contourIndex
                    nodes[index]['pos'] = contourDomain[contourIndex]
                    # print '\t\t', contourIndex, contourDomain[contourIndex]

        return nodes

    def assignCmpSpineLayout(self, **kwords):
        #index first by extrema then by function value
        if hasattr(self, 'cmpEG'):

            seg = self.cmpEG.segmentation(**kwords)

            graph = self.cmpEG.getConnectivity(**kwords)

            f = self.cmpFunc
            #record the cmp spine skeleton position
            self.cmpPos = dict()

            spine = dict()
            index_map = dict()
            nodes = dict()
            edges = []
            count = 0

            #extrema
            for ext in seg.keys():
                nodes[count] = {'id' : ext, 'f':f[ext,-1]}
                index_map[ext] = count
                count += 1

            #saddle
            for s in graph.keys():
                nodes[count] = {'id' : s, 'f':f[s,-1]}
                index_map[s] = count
                count += 1

            #all edges
            # print '---indexMap---',index_map
            # print '---seg.keys---', seg.keys()
            # print '---graph---', graph
            for s in graph.keys():
                # print '\t', s, graph[s]
                for ext in graph[s]:
                    edges.append([index_map[s], index_map[ext]])

            #layout cmp skeleton, update position
            nodes = self.layoutCmpSkeleton(nodes, edges)

            spine['nodes'] = nodes
            spine['edges'] = edges

            return spine, nodes, edges

    def setCmpEG(self, cmpFunc, cmpEG):
        self.cmpEG = cmpEG
        self.cmpFunc = cmpFunc.asArray()
        self.cmpfName = cmpFunc.dtype.names[-1]

    def computeCmpSpineJSON(self, **kwords):
        if hasattr(self, 'cmpEG'):
            spine, nodes, edges = self.assignCmpSpineLayout(**kwords)

            json = "{\n\t\"fname\":\""+self.cmpfName+"\",\n"

            json += "\t\"rangeNames\":["

            for name in self.rangeNames:
                json += "\""+name+"\","
            json = json[:-1]
            json += "],\n"

            json += "\t\"nodes\":["

            for n in spine['nodes'].values():
                #print n['id']
                json += "\n\t\t{\"functionValue\":%f,\n" % n['f']
                json += "\t\t \"position\":" + str(n['pos']) + ",\n"
                json += "\t\t \"index\":" + str(n['id']) + "\n"
                json += "\t\t},"

            json = json[:-1]
            json += "\n\t],\n"


            json += "\t\"link\":["

            if len(spine['edges'])>0:
                for e in spine['edges']:
                    json += "\"%d-%d\", " % (e[0],e[1])

                #this need to be guarded by edge number, otherwise the output json will be incorrect
                json = json[:-2]
            json += "]\n}\n"
            # print json
            return json
