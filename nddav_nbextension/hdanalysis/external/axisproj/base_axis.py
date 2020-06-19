from sys import argv
import numpy as np
import scipy as sp
from scipy.linalg import eig,svd,eigh
from scipy.sparse.linalg import eigs
from sklearn.neighbors import kneighbors_graph
from copy import deepcopy
from cvxpy import *
from scipy.spatial.distance import cdist
from utils import *

def findAP(X,projList,spar,k):
    omegaList = []
    targetList = []
    targetIDList = []
    d,N = X.shape
    for i in range(0,len(projList)):
        projL = projList[i]
        embL = projL.T.dot(X)
        Dict = []
        Xtemp = X
        allids = np.arange(X.shape[0],dtype=int)
        iglist = []
        preverr = 1e10
        omegatemp = []
        for j in range(0,spar):
            omega_rel = feaSelect(Xtemp,embL,3)
            print omega_rel
            omega = omega_rel.copy()
            omega[0] = allids[omega_rel[0]]
            omega[1] = allids[omega_rel[1]]

            flag = any((omega == x).all() for x in omegatemp)
            if flag == True:
                j = spar
            else:
                omegatemp.append(omega)
                proj = np.zeros((d,2))
                proj[omega[0],0] = 1
                proj[omega[1],1] = 1

                Dict.append(proj)
                beta,status = findCoeff(projL,Dict)

                if (status=='unbounded'):
                    j = spar
                else:
                    omegaList.append(omega)
                    targetList.append(projL)
                    targetIDList.append(i)

                    betaloc = np.array(beta)
                    C = matprod(projL,projL.T)
                    if len(Dict) == 1:
                        C -= beta*matprod(Dict[0],Dict[0].T)
                    else:
                        for jj in range(0,len(Dict)):
                            C -= beta[jj]*matprod(Dict[jj],Dict[jj].T)
                    if np.linalg.norm(C) < preverr:
                        preverr = np.linalg.norm(C)
                    else:
                        break
                    u,temp1,temp2 = np.linalg.svd(C)
                    embL = u[:,0:2].T.dot(X)
        if i == 0:
            if len(omegaList) == 1:
                betaList = np.array(betaloc).reshape((1,1))
            else:
                betaList = betaloc
        else:
            betaList = np.vstack((betaList,betaloc))

    return omegaList, betaList, targetList, targetIDList

def feaSelect(Xorig,Y,k,igList = -1):
    X = deepcopy(Xorig)

    if np.sum(igList) > 0:
        X[igList,:] = 0

    G = kneighbors_graph(Y.T,k,mode='connectivity',include_self=False).toarray()
    G = np.maximum(G, G.T)
    d = X.shape[0]
    xind,yind = np.where(np.triu(G == 1))
    A = np.power(X[:,xind] - X[:,yind],2)
    normA = np.sum(A,axis=0)
    A = np.divide(A,np.tile(normA+1e-16,(d,1)))
    A[np.isinf(A)] == 0
    A[np.isnan(A)] = 0

    C = A.T
    omega = range(0,d)
    omega_greedy = []
    for i in range(0,2):
        if i == 0:
            temp = np.zeros(C.shape)
        else:
            temp = np.tile(np.sum(C[:,omega_greedy],axis = 1),(len(omega),1)).T
        index = np.argmin(np.sum(np.abs(C[:,omega] + temp - float(i+1)/d),axis = 0))
        omega_greedy.append(omega[index])
        omega = np.delete(omega,index)

    return np.sort(np.array(omega_greedy))

def kscQP(K_DD,K_yD,lam):
    N = K_DD.shape[0]
    beta = Variable(N)
    loss = quad_form(beta, K_DD) - 2*K_yD*beta
    reg = norm(beta,1)
    lambd = Parameter(sign="positive")
    prob = Problem(Minimize(loss + lambd*reg))

    lambd.value = lam
    prob.solve()

    return beta.value

def findCoeff(target,D):
    K_DD = np.zeros((len(D),len(D)))
    K_yD = np.zeros((1,len(D)))

    for i in range(0,len(D)):
        K_yD[0,i] = np.linalg.norm(np.dot(target.T,D[i]),'fro')
        for j in range(0,len(D)):
            K_DD[i,j] = np.linalg.norm(np.dot(D[i].T,D[j]),'fro')

    u,s = np.linalg.eigh(K_DD)
    if np.min(u) < 0:
        K_DD = K_DD - np.min(u)*np.eye(len(D))

    beta = Variable(len(D))
    reg = norm(beta,2)
    loss = quad_form(beta, K_DD) - 2*K_yD*beta
    lambd = Parameter(sign="positive")
    prob = Problem(Minimize(loss + lambd*reg))
    lambd.value = 1e-2
    prob.solve()
    return (np.array(beta.value),prob.status)

def compEvid(omegaList,betaList,targetList,d):

    evid = []
    axisOmega = []

    while len(omegaList) > 0:
        omega = omegaList[0]
        indices = [(omega == x).all() for x in omegaList]
        idx = [i for i, x in enumerate(indices) if x == True]

        proj = np.zeros((d,2))
        proj[omega[0],0] = 1
        proj[omega[1],1] = 1
        C = matprod(proj,proj.T)

        delta = 1.0
        for i in idx:
            target = targetList[i]
            Ctar = matprod(target,target.T)
            beta = betaList[i]

            err = np.linalg.norm(Ctar - beta*C,'fro')
            alpha = np.exp(-8e-1*err)
            delta *= (1.0 - 0.9*alpha)

        temp = 1-delta
        evid.append(temp)
        axisOmega.append(omega)
        omegaList = [i for j, i in enumerate(omegaList) if j not in idx]
        betaList = [i for j, i in enumerate(betaList) if j not in idx]
        targetList = [i for j, i in enumerate(targetList) if j not in idx]
    return evid,axisOmega
