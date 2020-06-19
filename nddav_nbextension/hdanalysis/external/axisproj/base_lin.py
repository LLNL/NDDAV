from sys import argv
import numpy as np
import scipy as sp
from scipy.linalg import eig,svd,eigh
from scipy.sparse.linalg import eigs
from sklearn.neighbors import kneighbors_graph
from copy import deepcopy
from .utils import *
from pymanopt.manifolds import Grassmann
import nudged
from sklearn.metrics.pairwise import pairwise_distances

def findSingleLP(X,d,k,sigma,embMethod='lpp'):
    D,N = X.shape
    W = np.zeros((N,N))
    B = np.zeros((N,N))

    if embMethod == 'pca':
        for i in range(N-1):
            for j in range(i+1,N):
                W[i,j] = 1.0/N
        W = 0.5*(W + W.T)
        B = np.eye(N)
        L = B - W
        M1 = X.dot(L).dot(X.T)
        Mc = np.eye(M1.shape[0])
    elif embMethod == 'lpp':
        G = kneighbors_graph(X.T,k,mode='distance',include_self=False).toarray()
        W = 0.5*(G + G.T)
        W[W!=0] = np.exp(-W[W!=0] / (2*sigma*sigma))
        B = np.diag(np.sum(W,axis=0))
        L = B - W
        M1 = X.dot(L).dot(X.T)
        Mc = X.dot(B).dot(X.T)
    elif embMethod == 'rand':
        Gnk = Grassmann(D,2)
        proj = Gnk.rand()
        return [proj]
    elif embMethod == 'syn':
        proj = np.zeros((D,2))
        card = 2
        #ids = np.arange(D)
        ids = np.array([1,0,4,3]) # For ecoli 2
        #ids = np.array([2,7,3,0]) # For yeast 2
        #ids = np.array([12, 39,  5,  0, 45, 43]) # For seaWater 3
        #ids = np.array([0, 46,  5, 14, 11, 40, 49, 43]) # For seaWater 4
        np.random.shuffle(ids)
        #print ids
        proj[ids[:card],0] = 1/np.sqrt(card)
        proj[ids[card:2*card],1] = 1/np.sqrt(card)
        #proj[ids[card-1:2*card-1],1] = 1/np.sqrt(card) # For cities
        return [proj]

    u,s = eig(M1)
    if np.min(u) < 0:
        M1 = M1 - np.min(u)*np.eye(M1.shape[0])

    u,s = eig(Mc)
    if np.min(u) < 0:
        Mc = Mc - np.min(u)*np.eye(Mc.shape[0])

    eigvals,eigvecs = eig(M1,Mc)

    eigvecs = np.dot(sp.linalg.sqrtm(Mc),eigvecs)

    if embMethod == 'pca':
        ind = np.argsort(-eigvals)
        proj = eigvecs[:,ind[0:d]]
    elif embMethod == 'lpp':
        ind = np.argsort(eigvals)
        proj = eigvecs[:,ind[0:d]]

    return [proj]

def findMultipleLP(X,d,k,sigma,maxIter,embMethod='lpp',labs = None):
    N = X.shape[1]
    W = np.zeros((N,N))
    B = np.zeros((N,N))

    if embMethod == 'pca':
        for i in range(N-1):
            for j in range(i+1,N):
                W[i,j] = 1.0/N
        W = np.maximum(W, W.T)
        B = np.eye(N)
        L = B - W
        M1 = X.dot(L).dot(X.T)
        Mc = np.eye(M1.shape[0])

    elif embMethod == 'lpp':
        G = kneighbors_graph(X.T,k,mode='distance',include_self=False).toarray()
        W = 0.5*(G + G.T)
        W[W!=0] = np.exp(-W[W!=0] / (2*sigma*sigma))
        B = np.diag(np.sum(W,axis=0))
        L = B - W
        M1 = X.dot(L).dot(X.T)
        Mc = X.dot(B).dot(X.T)

    elif embMethod == 'lde':
        Gw = np.zeros((N,N))
        Gb = np.zeros((N,N))

        dists = pairwise_distances(X.T)

        for ii in range(N):
            inds = np.where(labs == labs[ii])[0]
            sinds = np.argsort(dists[ii,inds])
            Gw[ii,inds[sinds[:k]]] = 1

            inds = np.where(labs != labs[ii])[0]
            sinds = np.argsort(dists[ii,inds])
            Gb[ii,inds[sinds[:k]]] = 1

        Gw = np.maximum(Gw, Gw.T)
        Bw = np.diag(np.sum(Gw,axis=0))
        Lw = Bw - Gw
        M1 = X.dot(Lw).dot(X.T)

        Gb = np.maximum(Gb, Gb.T)
        Bb = np.diag(np.sum(Gb,axis=0))
        Lb = Bb - Gb
        Mc = X.dot(Lb).dot(X.T)

    u,s = eig(M1)
    u = np.real(u)
    if np.min(u) < 0:
        M1 = M1 - np.min(u)*np.eye(M1.shape[0])

    u,s = eig(Mc)
    u = np.real(u)
    if np.min(u) < 0:
        Mc = Mc - np.min(u)*np.eye(Mc.shape[0])

    projList = []
    projListFinal = []
    if embMethod == 'lde':
        # gamma = 1e3 # bio 1e3
        gamma = 5e2
        thresh = 0.5*2
    else:
        gamma = 1e4
        thresh = 0.6*2
    for iters in range(1,maxIter+1):
        if iters > 1:
            #print np.linalg.norm(X.dot(L).dot(X.T)), np.linalg.norm(C)
            if embMethod == 'pca':
                M1 = X.dot(L).dot(X.T) - gamma*C
            elif embMethod == 'lpp':
                M1 = X.dot(L).dot(X.T) + gamma*C
            elif embMethod == 'lde':
                M1 = X.dot(Lw).dot(X.T) + gamma*C
            M1 = 0.5*(M1 + M1.T)
            u,s = np.linalg.eig(M1)
            if np.min(u) < 0:
                M1 = M1 - np.min(u)*np.eye(M1.shape[0])
        eigvals,eigvecs = eig(M1,Mc)

        eigvals = np.real(eigvals)
        eigvecs = np.real(eigvecs)
        eigvecs = np.dot(np.real(sp.linalg.sqrtm(Mc)),eigvecs)

        if embMethod == 'pca':
            ind = np.argsort(-eigvals)
            temp = eigvecs[:,ind[0:d]]
        elif embMethod == 'lpp' or embMethod == 'lde':
            ind = np.argsort(eigvals)
            temp = eigvecs[:,ind[0:d]]

        for dim in range(2):
            temp[:,dim] /= np.linalg.norm(temp[:,dim])

        if len(projList) == 0:
            projList.append(temp)
            C = matprod(temp,temp.T)
            projListFinal.append(temp)
        else:
            projList.append(temp)
            C = grassSum(projList)

            #print np.linalg.norm(temp[:,0]), np.linalg.norm(temp[:,1])

            mval = 1e10
            for kk in projListFinal:
                mval = np.minimum(mval, 2 - np.linalg.norm(matprod(temp.T,kk)))

            if  mval > thresh:
                err = []
                emb1 = (temp.T.dot(X)).T
                emb1 = emb1.tolist()
                for ps in projListFinal:
                        emb2 = (ps.T.dot(X)).T
                        emb2 = emb2.tolist()
                        trans = nudged.estimate(emb1, emb2)
                        tt = np.linalg.norm(np.array(emb2) - np.array(trans.transform(emb1)))/np.linalg.norm(emb2)
                        err.append(tt)
                    # print np.linalg.norm(emb1), err
                #print mval, np.min(np.array(err))
                if np.min(np.array(err)) > 0.8:
                    projListFinal.append(temp)
    #print len(projList), len(projListFinal)
    return projListFinal

def grassSum(projList):
    T = len(projList)
    n = projList[0].shape[0]
    Bs = np.zeros((n,n))
    #print projList[0]
    for t in range(0,T):
        Bs += matprod(projList[t],projList[t].T)
    return Bs

def grassMean(projList):
    T = len(projList)
    n = projList[0].shape[0]
    Bs = np.zeros((n,n))
    idn = np.eye(n)

    for t in range(0,T):
        temp = matprod(projList[t],projList[t].T)
        Bs += idn - temp
    Bs = 0.5*(Bs + Bs.T)
    u,s = np.linalg.eig(Bs)
    u = np.real(u)
    if np.min(u) < 0:
        Bs = Bs - np.min(u)*np.eye(Bs.shape[0])

    eigvalue,eigvector = eig(Bs)
    eigvalue = np.real(eigvalue)
    eigvector = np.real(eigvector)
    ind = np.argsort(eigvalue)
    eigvector = (eigvector[:,ind[0:2]])

    return eigvector

def DNM_TR(A,B,d,dectype):

    def partial_evd(A,B,ll,d):
        D, W = eigs(A - ll*B, k = d, which = 'LR')
        D = np.real(D)
        W = np.real(W)
        return D, W

    def full_evd(A,B,ll,d):
        D, W = eig(A-ll*B)
        D = np.real(D)
        W = np.real(W)
        sind = np.argsort(-D)
        D = D[sind[range(d)]]
        W = W[:,sind[range(d)]]
        return D, W

    maxiter = 100
    tol = 1e-5
    ll = 0
    llold = np.Inf
    llall = []

    if dectype.lower() == 'partial':
        f = partial_evd
    elif dectype.lower() == 'full':
        f = full_evd
    else:
        print ('Invalid option for dectype')

    for i in range(maxiter):
        D, W = f(A,B,ll,d)

        betap = -np.diag(matprod(W.T,B,W))
        llold = ll
        ll = np.sum(llold*betap-D)/np.sum(betap)

        llall.append(ll)

        if (i > 1):
            if (np.abs(ll-llold)/np.abs(llold) < tol):
                break
    if False:
        plt.figure()
        plt.plot(llall)

    return D, W
