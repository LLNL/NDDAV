#from __future__ import print_function
'''
Driver Script 1
Input: A Single Linear Projection
Output: Set of Axis-Aligned Projections that Explain the Structure

Parameters:
dSet - name of the dataset
embMethod - pca, lpp
spar - Maximum number of axis-aligned subspaces to use
k - number of neighbors to use for the sparse decomposition
sigma - parameter for graph construction
nSize - number of neighbors to use for precision-recall computation
factor - for precision recall computation
'''

from os import mkdir,path
import numpy as np
from scipy import linalg
import matplotlib.pyplot as plt
from itertools import *
import shutil
import matplotlib as mpl
from matplotlib.colors import ListedColormap
from scipy import stats, io
from sklearn import preprocessing
from time import time

from utils import *
from base_lin import *
from base_axis import *

mpl.rcParams['xtick.labelsize'] = 15
mpl.rcParams['ytick.labelsize'] = 15

# Define parameters
dSet = 'ecoli'
embMethod = 'syn' # pca, lpp, syn, rand
spar = 5
k = 12
sigma = 0.3
nSize = 30
factor = 1.5
preproc = False

if not path.exists('results/' + dSet):
    mkdir('results/' + dSet)

if path.exists('results/' + dSet + '/decomp_single_' + embMethod + '/'):
    shutil.rmtree('results/' + dSet + '/decomp_single_' + embMethod + '/')
mkdir('results/' + dSet + '/decomp_single_' + embMethod + '/')

fname = 'data/' + dSet + '.mat'
data = io.loadmat(fname)
X = data['X']
print X.shape
d,N = X.shape

if preproc:
    X = preprocessing.scale(X,axis=1)

projList = findSingleLP(X,2,k,sigma,embMethod)
emb = projList[0].T.dot(X)
qualityTrue = compPR(X,emb,nSize,factor)

plt.figure(1)
plt.scatter(emb[0,:],emb[1,:],marker='o',color='r',alpha=0.7,s=20,vmin=0,vmax=1)
plt.savefig('results/' + dSet + '/decomp_single_' + embMethod + '/' + 'lin_emb.pdf')
plt.close()

omegaList, betaList, targetList, targetIDList = findAP(X,projList,spar,k)
betaList = np.array(betaList)/np.sum(np.array(betaList))
quality = np.zeros((N))
for i in range(len(omegaList)):
    omega = np.abs(omegaList[i])
    beta = betaList[i]
    if beta >= 0.05:
        proj = np.zeros((X.shape[0],2))
        proj[omega[0],0] = 1
        proj[omega[1],1] = 1
        emb = proj.T.dot(X)
        quality = np.maximum(quality,compPR(X,emb,nSize,factor))
        plt.figure(1)
        plt.scatter(emb[0,:],emb[1,:],marker='o',color='r',alpha=0.7,s=20,vmin=0,vmax=1)
        plt.xlabel('var'+str(omega[0]))
        plt.ylabel('var'+str(omega[1]))
        plt.savefig('results/' + dSet + '/decomp_single_' + embMethod + '/' + 'axis_align_emb'+ str(i) +'.pdf')
        plt.close()
        print("Axis-aligned projection %d - [%d,%d] with weight %f " % (i,omega[0],omega[1],beta))

print np.min(quality)
fig, ax = plt.subplots(figsize=(8,6))
notnd1,binsL,notnd2 = ax.hist(qualityTrue, bins= np.arange(0,1,0.05), color='blue', normed=True, alpha=0.4)
ax.hist(quality,bins=binsL,normed=True, color='salmon',alpha=0.5)
plt.legend(['Linear','Axis-Aligned'],fontsize=20,loc='best')
ax.set_ylim(bottom=0)
plt.xlabel('Embedding Quality', fontsize=20)
for label in ax.xaxis.get_ticklabels()[::2]:
    label.set_visible(False)

plt.savefig('results/' + dSet + '/decomp_single_' + embMethod + '/' + 'qualityhist.pdf')
plt.close()

emb = projList[0]
print emb
for i in range(2):
    if i == 0:
        ids = np.where(np.abs(emb[:,i]) > 0.2)[0]
    else:
        ids = np.union1d(ids,np.where(np.abs(emb[:,i]) > 0.2)[0])
print ids
