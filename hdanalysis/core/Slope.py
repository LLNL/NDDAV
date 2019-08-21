from numpy import sqrt,vdot, fabs,array

class Slope(object):
    """Abstract base class for all slope metrics. Given two points of arbirary
    dimension a slope will compute a single value indicating the \"slope\" of an
    edge betwee the points. Traditionally, a segmentation will use a slope to
    cluster points where neighbors choose to cluster according to the highest
    positive slope. The intuition come from computing stable manifolds in which
    the sloe literally is the steepness of an edge. Negative slopes indicate
    \"invalid\" edges.

    A slope will assume points to act like arrays e.g. implement the standard
    index operators point[i], point[-k], point[i:j] etc.
    """

    def __init__(self):
        object.__init__(self)

    def setup(self,point_data):
        self.data = point_data.view('f4').reshape([point_data.shape[0],point_data.dim()])

    def range(self,i,j):
        return fabs(self.data[i,-1] - self.data[j,-1])

class AscendingEuclidian(Slope):
    """Computes the slope as the difference in function value divided by the
    euclidian distance between points. It assumes the last coordinate to be the
    function value.
    """

    def __init__(self):
        Slope.__init__(self)

    def eval(self,e):
        mag = sqrt(vdot(self.data[e[0],:-1] - self.data[e[1],:-1], self.data[e[0],:-1] - self.data[e[1],:-1]))
        if mag == 0:
            if self.asc(e):
                return 10e33
            else:
                return -10e33
        else:
            return (self.data[e[1],-1] - self.data[e[0],-1]) / mag

    def asc(self,e):
        return (self.data[e[0],-1] < self.data[e[1],-1]) or (self.data[e[0],-1] == self.data[e[1],-1] and e[0] < e[1])

    def cmp(self,i,j):
        if i==j:
            return 0

        if self.data[i,-1] < self.data[j,-1]:
            return -1
        elif  self.data[i,-1] > self.data[j,-1]:
            return 1
        elif i < j:
            return -1
        else:
            return 1



class DescendingEuclidian(Slope):
    """Computes the slope as the inverse difference in function value divided by
    the euclidian distance between points. It assumes the last coordinate to be
    the function value.
    """

    def __init__(self):
        Slope.__init__(self)


    def eval(self,e):

        mag = sqrt(vdot(self.data[e[0],:-1] - self.data[e[1],:-1], self.data[e[0],:-1] - self.data[e[1],:-1]))
        if mag == 0:
            if self.asc(e):
                return 10e33
            else:
                return -10e33
        else:
            return (self.data[e[0],-1] - self.data[e[1],-1]) / mag

    def asc(self,e):
        return (self.data[e[1],-1] < self.data[e[0],-1]) or (self.data[e[1],-1] == self.data[e[0],-1] and e[1] < e[0])

    def cmp(self,i,j):
        if i==j:
            return 0

        if self.data[i,-1] > self.data[j,-1]:
            return -1
        elif  self.data[i,-1] < self.data[j,-1]:
            return 1
        elif i > j:
            return -1
        else:
            return 1
