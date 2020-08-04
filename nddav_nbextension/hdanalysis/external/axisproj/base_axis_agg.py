from sys import argv
import numpy as np
import scipy as sp
from scipy.linalg import eig,svd,eigh
from scipy.sparse.linalg import eigs
from sklearn.neighbors import kneighbors_graph
from copy import deepcopy
from cvxpy import *
from scipy.spatial.distance import cdist
from .utils import *

def findAP(X,projList,spar,k):
    omegaList = []
    targetList = []
    targetIDList = []
    LP_AP_PRList = []
    LP_AP_EvidList = []
    d,N = X.shape
    for i in range(0,len(projList)):
        projL = projList[i]
        embL = projL.T.dot(X)
        Dict = []
        preverr = 1e10
        omegatemp = []
        for j in range(0,spar):
            omega, bound = feaSelect(X,embL,k, omegaList)
            flag = any((omega == x).all() for x in omegatemp)
            if flag == True:
                break
            else:
                Dicttemp = Dict

                proj = np.zeros((d,2))
                proj[omega[0],0] = 1
                proj[omega[1],1] = 1
                Dict.append(proj)
                beta,status = findCoeff(projL,Dict)
                if (status=='unbounded'):
                    break
                C = matprod(projL,projL.T)
                if len(Dict) == 1:
                    C -= beta*matprod(Dict[0],Dict[0].T)
                else:
                    for jj in range(0,len(Dict)):
                        C -= beta[jj]*matprod(Dict[jj],Dict[jj].T)
                #err_new = np.linalg.norm(C)
                #err_existing = []
                #beta_existing = []
                #C_existing = []
                #proj_existing = []
                #for omtemp in omegaList:
                #    flag = any((omtemp == x).all() for x in omegatemp)
                #    if flag == False:
                    #     proj = np.zeros((d,2))
                    #     proj[omtemp[0],0] = 1
                    #     proj[omtemp[1],1] = 1
                    #     Dicttemp.append(proj)
                    #     betatemp,status = findCoeff(projL,Dicttemp)
                    #     Ctemp = matprod(projL,projL.T)
                    #     if len(Dicttemp) == 1:
                    #         Ctemp -= betatemp*matprod(Dicttemp[0],Dicttemp[0].T)
                    #     else:
                    #         if (status=='unbounded'):
                    #             err_existing.append(1e10)
                    #             beta_existing.append([])
                    #             C_existing.append(0)
                    #             proj_existing.append([])
                    #         else:
                    #             for jj in range(0,len(Dicttemp)):
                    #                 Ctemp -= betatemp[jj]*matprod(Dicttemp[jj],Dicttemp[jj].T)
                    #             err_existing.append(np.linalg.norm(Ctemp))
                    #             beta_existing.append(betatemp)
                    #             C_existing.append(Ctemp)
                    #             proj_existing.append(proj)
                    #         del Dicttemp[-1]
                    # else:
                    #     err_existing.append(1e10)
                    #     beta_existing.append([])
                    #     C_existing.append(0)
                    #     proj_existing.append([])

                # if len(omegaList) > 0:
                #     err_old = np.min(np.array(err_existing))
                #     print err_new, err_old, (err_old - err_new)/err_old
                #     if err_old < 1e10 and ((err_old - err_new)/err_old) < 0.005:
                #         del Dict[-1]
                #         ind_ex = np.argmin(err_existing)
                #         Dict.append(proj_existing[ind_ex])
                #         C = C_existing[ind_ex]
                #         omega = omegaList[ind_ex]
                #         beta = beta_existing[ind_ex]

                # if np.linalg.norm(C) < preverr:
                #     preverr = np.linalg.norm(C)
                # else:
                #     break

                omegatemp.append(omega)
                omegaList.append(omega)
                targetList.append(projL)
                targetIDList.append(i)
                betaloc = np.array(beta)
                u,temp1,temp2 = np.linalg.svd(C)
                embL = u[:,0:2].T.dot(X)
        if i == 0:
            if len(omegaList) == 1:
                betaList = np.abs(np.array(betaloc)).reshape((1,1))
            else:
                betaList = np.abs(betaloc)
        else:
            betaList = np.vstack((betaList,np.abs(betaloc)))

    for i in range(len(targetList)):
        Ctemp = matprod(targetList[i],targetList[i].T)
        omega = omegaList[i]
        proj = np.zeros((d,2))
        proj[omega[0],0] = 1
        proj[omega[1],1] = 1

        Y = targetList[i].T.dot(X)
        G = kneighbors_graph(Y.T,k,mode='connectivity',include_self=False).toarray()
        G = np.maximum(G, G.T)
        d = X.shape[0]
        xind,yind = np.where(np.triu(G == 1))
        C = np.power(X[:,xind] - X[:,yind],2)
        C = C.T

        B = Y[:,xind] - Y[:,yind]
        normB = np.power(np.linalg.norm(B,axis=0).reshape(B.shape[1],1),2)
        bound = np.linalg.norm(C[:,omega] - np.tile(normB,(1,2)))/np.sum(normB)
        LP_AP_EvidList.append(bound)
        LP_AP_PRList.append(np.average(compPR(targetList[i].T.dot(X),proj.T.dot(X),30,1)))
    #print LP_AP_EvidList
    LP_AP_EvidList = 1/np.array(LP_AP_EvidList)
    LP_AP_EvidList /= np.max(LP_AP_EvidList)
    LP_AP_EvidList[LP_AP_EvidList ==0 ] = 0.05
    return omegaList, betaList, targetList, targetIDList, LP_AP_PRList, LP_AP_EvidList

def feaSelect(Xorig,Y,k,prevList = []):
    X = deepcopy(Xorig)

    G = kneighbors_graph(Y.T,k,mode='connectivity',include_self=False).toarray()
    G = np.maximum(G, G.T)
    d = X.shape[0]
    xind,yind = np.where(np.triu(G == 1))
    A = np.power(X[:,xind] - X[:,yind],2)
    #normA = np.linalg.norm(A,axis=0)
    #A = np.divide(A,np.tile(normA+1e-16,(d,1)))
    A[np.isinf(A)] == 0
    A[np.isnan(A)] = 0

    B = Y[:,xind] - Y[:,yind]
    normB = np.power(np.linalg.norm(B,axis=0).reshape(B.shape[1],1),2)

    C = A.T
    # D = B.T
    # Dnorm = np.linalg.norm(D,axis=1).reshape(D.shape[0],1)

    omega = range(0,d)
    omega_greedy = []
    for i in range(0,2):
        if i == 0:
            temp = np.zeros(C.shape)
        else:
            temp = np.tile(np.sum(C[:,omega_greedy],axis = 1),(len(omega),1)).T
        secref = np.tile(normB,(1,len(omega)))
        #index = np.argmin(np.linalg.norm(C[:,omega] + temp - float(i+1)/d,axis = 0))

        index = np.argmin(np.linalg.norm(C[:,omega] + temp - secref,axis = 0))
        omega_greedy.append(omega[index])
        omega = np.delete(omega,index)

    ref = np.linalg.norm(C[:,omega_greedy] - np.tile(normB,(1,2)))/np.sum(normB)
    if len(prevList) > 0:
        for temp in prevList:
            cur = np.linalg.norm(C[:,temp] - np.tile(normB,(1,2)))/np.sum(normB)
            if  cur < 1.1*ref:
                #print 'here'
                ref = cur
                omega_greedy = temp


    return np.sort(np.array(omega_greedy)), ref

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

    u,s = np.linalg.eig(K_DD)
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

            err = np.linalg.norm(Ctar - beta*C,'fro')/np.linalg.norm(Ctar)
            alpha = np.exp(-8e-1*err)
            #print err,alpha
            delta *= (1.0 - 0.9*alpha)

        temp = 1-delta
        evid.append(temp)
        axisOmega.append(omega)
        omegaList = [i for j, i in enumerate(omegaList) if j not in idx]
        betaList = [i for j, i in enumerate(betaList) if j not in idx]
        targetList = [i for j, i in enumerate(targetList) if j not in idx]
    return evid,axisOmega


def compEvid_from_LP_AP(LP_AP_EvidList, omegaList):

    evid = []
    axisOmega = []
    #print LP_AP_EvidList
    while len(omegaList) > 0:
        omega = omegaList[0]
        indices = [(omega == x).all() for x in omegaList]
        idx = [i for i, x in enumerate(indices) if x == True]

        delta = 1.0
        for i in idx:
            delta *= (1.0 - 0.9*LP_AP_EvidList[i])

        temp = 1-delta
        evid.append(temp)
        axisOmega.append(omega)
        omegaList = [i for j, i in enumerate(omegaList) if j not in idx]
        LP_AP_EvidList = [i for j, i in enumerate(LP_AP_EvidList) if j not in idx]
    #print evid
    #print axisOmega
    return evid,axisOmega
