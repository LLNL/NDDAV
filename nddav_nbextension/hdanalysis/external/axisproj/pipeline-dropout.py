from sys import argv
from os import mkdir,path
import numpy as np
from scipy import linalg
import matplotlib.pyplot as plt
from scipy import stats, io
from sklearn import preprocessing
from time import time
import argparse
from utils import *
from itertools import *
from ksc import *
import shutil
import matplotlib as mpl
from sklearn.svm import SVC
from matplotlib.colors import ListedColormap


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Compute Optimal Projections')
    parser.add_argument('-data', help='dataset', default='bio')
    parser.add_argument('-k', help='number of neighbors', type=int,default=15)
    parser.add_argument('-gamma', help='Penalty for grassmann distance', type=float,default=1e8)
    parser.add_argument('-sigma', help='Parameter for the Gaussian kernel', type=float,default=0.5)
    parser.add_argument('-maxIter', help='Number of projections', type=int,default=25)
    parser.add_argument('-p', help='number of neighbors for feature selection', type=int,default=3)
    parser.add_argument('-standardize', help='option to standardize input data', type=int,default=0)
    parser.add_argument('-scale', help='option to scale input data to [0,1]', type=int,default=0)
    parser.add_argument('-normalize', help='option to normalize input data to unit norm', type=int,default=0)

    args = vars(parser.parse_args())
    dSet = args['data']
    k = args['k']
    gamma = args['gamma']
    sigma = args['sigma']
    maxIter = args['maxIter']
    p = args['p']

    mpl.rcParams['xtick.labelsize'] = 15
    mpl.rcParams['ytick.labelsize'] = 15

    numsearch = 50
    factor = 3
    numRuns = 5
    dpct = 0.1
    spar = 5

    print('\nRunning Algorithm for Computing Optimal Axis-Aligned Projection Set')

    if (path.exists('results/' + dSet + '/')):
        shutil.rmtree('results/' + dSet + '/')
    mkdir('results/' + dSet + '/')
    mkdir('results/' + dSet + '/linproj/')
    mkdir('results/' + dSet + '/axis/')

    t0 = time()
    fname = 'data/' + dSet + '.mat'
    data = io.loadmat(fname)
    X = data['X']
    names = data['names'][0]

    d,T = X.shape

    if args['standardize']:
        X = preprocessing.scale(X,axis=1)
    elif args['scale']:
        min_max_scaler = preprocessing.MinMaxScaler()
        X = min_max_scaler.fit_transform(X.T).T
    elif args['normalize']:
        X = preprocessing.normalize(X)

    to = time()
    projList = lppGrass(X.T,2,k,sigma,maxIter)

    for i in range(0,len(projList)):
        plt.figure(1)
        plt.clf()
        ax = plt.gca()
        ax.set_axis_bgcolor((0.87, 0.93, 0.96))
        emb = projList[i].T.dot(X)
        met = compPR(X,emb,numsearch,factor)
        plt.scatter(emb[0,:],emb[1,:],marker='s',alpha=0.75,s=20,c=met,vmin=0,vmax=1,cmap=plt.get_cmap('seismic'))
        plt.colorbar()
        plt.savefig('results/' + dSet + '/linproj/' + 'sub' + str(i) + '_emb.png')
        precGrass, recGrass = compPRcurve(X,emb,50)
        plt.clf()
        plt.plot(recGrass,precGrass,'bs-',linewidth=2)
        plt.xlabel('Average Recall',size=20,fontweight='bold')
        plt.ylabel('Average Precision',size=20,fontweight='bold')
        plt.savefig('results/' + dSet + '/linproj/' + 'sub' + str(i) + '_PR.png')
    print('Finished Generating Projection Candidates in %f' % (time()-t0))


    t0 = time()

    omegaAll = []
    targetAll = []
    betaAll = []

    for r in range(0,numRuns+1):
        print(r)
        omegaAll.append([])
        targetAll.append([])
        betaAll.append([])
        temp = np.random.permutation(d)
        dropout = temp[0:int(np.ceil(dpct*d))]

        for i in range(0,len(projList)):
            projL = projList[i]
            embL = projL.T.dot(X)
            Dict = []
            omegaList = []
            for j in range(0,spar):
                if r == numRuns:
                    omega = feaSelect(X,embL,p)
                else:
                    omega = feaSelect(X,embL,p,dropout)

                flag = any((omega == x).all() for x in omegaList)
                if flag == True:
                    j = spar
                else:
                    omegaList.append(omega)

                    proj = np.zeros((d,2))
                    proj[omega[0],0] = 0.707
                    proj[omega[1],1] = 0.707

                    Dict.append(proj)

                    beta,status = findCoeff(projL,Dict)

                    if (status=='unbounded'):
                        j = spar
                    else:
                        betaloc = beta
                        omegaAll[r].append(omega)
                        targetAll[r].append(projL)
                        C = matprod(projL,projL.T)
                        if len(Dict) == 1:
                            C -= beta*matprod(Dict[0],Dict[0].T)
                        else:
                            for jj in range(0,len(Dict)):
                                C -= beta[jj]*matprod(Dict[jj],Dict[jj].T)

                        u,temp1,temp2 = np.linalg.svd(C)
                        embL = u[:,0:2].T.dot(X)
            if i+r == 0:
                betacur = betaloc
            else:
                betacur = np.vstack((betacur,betaloc))
        betaAll[r].append(betacur)


        print('Finished Generating Axis-Aligned Projections in %f' % (time()-t0))
        t0 = time()
        evid,axisOmega = compEvidEnsemble(omegaAll,betaAll,targetAll,d)

        print('Finished Computing Evidences in %f' % (time()-t0))


        t0 = time()
        evid = np.array(evid)
        #evid = evid/np.sum(evid)
        #evid[evid < 1e-2] = 0
        evid = evid/np.max(evid)
        evid[evid < 5e-2] = 0

        sortIDs = np.argsort(-evid)
        shortList = []
        evidshort = []
        for indx in range(0,len(sortIDs)):
            v = float(evid[sortIDs[indx]])

            if v > 0:
                var = axisOmega[sortIDs[indx]]
                emb = X[var,:]
                plt.clf()
                ax = plt.gca()
                ax.set_axis_bgcolor((0.87, 0.93, 0.96))
                met = compPR(X,emb,numsearch,factor)
                if dSet == 'bio':
                    met = data['Y']
                plt.scatter(emb[0,:],emb[1,:],marker='s',alpha=0.75,s=20,c=met,vmin=0,vmax=1,cmap=plt.get_cmap('Reds'))
                plt.colorbar()
                plt.xlabel(names[var[0]][0],size=20,fontweight='bold')
                plt.ylabel(names[var[1]][0],size=20,fontweight='bold')
                plt.title('Normalized Evidence = %.3f' % v,size=20,fontweight='bold')
                plt.savefig('results/' + dSet + '/axis/' + 'sub' + str(indx) + '_emb.png')
                temp = 'S' + str(var[0]+1) + '/' + str(var[1]+1)
                shortList.append(temp)
                evidshort.append(v)

                if dSet == 'bio':
                    classifier = SVC(gamma=2, C=1)
                    classifier.fit(emb.T, np.squeeze(met))
                    x_min, x_max = emb[0,:].min() - .5, emb[0,:].max() + .5
                    y_min, y_max = emb[1,:].min() - .5, emb[1,:].max() + .5
                    xx, yy = np.meshgrid(np.arange(x_min, x_max, 0.02),
                         np.arange(y_min, y_max, 0.02))
                    if hasattr(classifier, "decision_function"):
                        Z = classifier.decision_function(np.c_[xx.ravel(), yy.ravel()])
                    Z = Z.reshape(xx.shape)
                    cm = plt.cm.RdBu
                    cm_bright = ListedColormap(['#FF0000', '#0000FF'])
                    plt.clf()
                    ax = plt.gca()
                    ax.contourf(xx, yy, Z, cmap=cm, alpha=.8)
                    ax.scatter(emb[0,:], emb[1,:], c=met, cmap=cm_bright)
                    plt.xlabel(names[var[0]][0],size=20,fontweight='bold')
                    plt.ylabel(names[var[1]][0],size=20,fontweight='bold')
                    plt.title('Normalized Evidence = %.3f' % v,size=20,fontweight='bold')
                    plt.savefig('results/' + dSet + '/axis/' + 'sub' + str(indx) + '_class.png')

        ids = evid > 0
        plt.figure(2,figsize=(20,16))
        #plt.scatter(range(1,len(shortList)+1),evidshort,marker="s",color='b',s=100)
        plt.bar(range(1,len(shortList)+1),evidshort,width=0.8,color=(0.36,0.42,0.88),edgecolor='b')
        ax = plt.gca()
        plt.xticks(np.array(range(1,len(shortList)+1))+0.4,shortList,rotation=45,size=20)
        plt.xlabel('Axis-Aligned Subspace',size=30,fontweight='bold')
        plt.ylabel('Normalized Evidence',size=30,fontweight='bold')
        plt.savefig('results/' + dSet + '/axis/' + 'evid.png')



    print('Finished saving figures in %f' % (time()-t0))
