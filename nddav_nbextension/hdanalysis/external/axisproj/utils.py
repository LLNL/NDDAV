from sys import argv
import numpy as np
import scipy as sp
from scipy.linalg import eig,svd,eigh
from scipy.sparse.linalg import eigs
from sklearn.neighbors import kneighbors_graph
from copy import deepcopy

def matprod(*args):
    return reduce(np.dot, args)

def orth(A):
    Q,S,temp = svd(A,full_matrices=False)
    tol = np.max(A.shape) * S[0] * 2.2e-16
    r = np.sum(S > tol)
    Q = Q[:,0:r]
    return Q

def compPR(X,Y,nSize,factor):
    T = Y.shape[1]
    G = kneighbors_graph(X.T,nSize,mode='connectivity',include_self=False).toarray()
    H = kneighbors_graph(Y.T,int(nSize*factor),mode='connectivity',include_self=False).toarray()
    TP = np.multiply(G,H).sum(axis=1)
    FP = np.multiply((1-G),H).sum(axis=1)
    FN = np.multiply(G,(1-H)).sum(axis=1)
    p = np.divide(TP,TP+FP)
    r = np.divide(TP,TP+FN)
    return (0.5*p + 0.5*r)

def compPRcurve(X,Y,nSize):
    T = Y.shape[1]
    G = kneighbors_graph(X.T,nSize,mode='connectivity',include_self=False).toarray()
    i = 1
    precList = []
    recList = []
    for k in xrange(1,np.minimum(400,T),20):
        H = kneighbors_graph(Y.T,k,mode='connectivity',include_self=False).toarray()
        TP = np.multiply(G,H).sum(axis=1)
        FP = np.multiply((1-G),H).sum(axis=1)
        FN = np.multiply(G,(1-H)).sum(axis=1)
        p = np.average(np.divide(TP,TP+FP))
        precList.append(p)
        r = np.average(np.divide(TP,TP+FN))
        recList.append(r)
    return (np.array(precList),np.array(recList))

def plot_decision_regions(X, y, classifier, resolution=0.02):
    import matplotlib.pyplot as plt
    # setup marker generator and color map
    markers = ('s', 'x', 'o', '^', 'v')
    colors = ('red', 'blue', 'lightgreen', 'gray', 'cyan')
    cmap = ListedColormap(colors[:len(np.unique(y))])

    # plot the decision surface
    x1_min, x1_max = X[:, 0].min() - 1, X[:, 0].max() + 1
    x2_min, x2_max = X[:, 1].min() - 1, X[:, 1].max() + 1
    xx1, xx2 = np.meshgrid(np.arange(x1_min, x1_max, resolution),
                           np.arange(x2_min, x2_max, resolution))
    Z = classifier.predict(np.array([xx1.ravel(), xx2.ravel()]).T)
    Z = Z.reshape(xx1.shape)
    plt.contourf(xx1, xx2, Z, alpha=0.4, cmap=cmap)
    plt.xlim(xx1.min(), xx1.max())
    plt.ylim(xx2.min(), xx2.max())

    # plot class samples
    for idx, cl in enumerate(np.unique(y)):
        plt.scatter(x=X[y == cl, 0], y=X[y == cl, 1],
                                           alpha=0.8, c=cmap(idx),
                                           marker=markers[idx], label=cl)
