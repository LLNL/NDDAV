#from __future__ import print_function
'''
Driver Script 3 - Supervised Case
Input: Multiple Linear Projections
Output: Set of Axis-Aligned Projections that Explain the Structure in the union
of all linear projections

Parameters:
dSet - name of the dataset
embMethod - pca, lpp
maxIter - Maximum number of linear projections
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
from scipy import stats, io, misc
from sklearn import preprocessing
from time import time

from utils import *
from base_lin import *
from base_axis import *

mpl.rcParams['xtick.labelsize'] = 15
mpl.rcParams['ytick.labelsize'] = 15

# Define parameters
dSet = 'cervical'

embMethod = 'lpp'
maxIter = 20
k = 12
sigma = 0.3
nSize = 30
factor = 1
preproc = False

if not path.exists('results/' + dSet):
    mkdir('results/' + dSet)
if (path.exists('results/' + dSet + '/decomp_multiple_' + embMethod + '/')):
    shutil.rmtree('results/' + dSet + '/decomp_multiple_' + embMethod + '/')
mkdir('results/' + dSet + '/decomp_multiple_' + embMethod + '/')

fname = 'data/' + dSet + '.csv'
data = np.loadtxt(fname,delimiter=',')
X = data[:,:-1].T
y = data[:,-1]
print X.shape, y.shape

d,N = X.shape
spar = np.minimum(5,int(misc.comb(d,2)/3))
print spar
if preproc:
    sc = preprocessing.StandardScaler()
    X = sc.fit_transform(X.T).T

print np.mean(X[0,:]), np.std(X[2,:]), np.mean(X[:,1])

projList = findMultipleLP(X,2,k,sigma,maxIter, embMethod)

print "\nList of linear projections:"
qualityTrue = np.zeros((N,))
for i in range(len(projList)):
    emb = projList[i].T.dot(X)
    qualityTrue = np.maximum(qualityTrue,compPR(X,emb,nSize,factor))
    print("LP %d " % (i))

    plt.figure(1)
    plt.scatter(emb[0,:],emb[1,:],marker='o',c=y,alpha=0.7,s=20,vmin=0,vmax=1,cmap=plt.get_cmap('jet'))
    plt.savefig('results/' + dSet + '/decomp_multiple_' + embMethod + '/' + 'lin_emb' + str(i) + '.pdf')
    plt.close()

omegaList, betaList, targetList, targetIDList = findAP(X,projList,spar,k)

# Print Edges
print "\nList of edges between LP and AAP:",

for i in range(len(projList)):
    inds = [ii for ii, jj in enumerate(targetIDList) if jj == i]
    print "\nLP %d:" % (i),
    for j in inds:
        omega = omegaList[j]
        print "[%d,%d] %f," % (omega[0], omega[1], betaList[j]),
evidList, axisOmegaList = compEvid(omegaList,betaList,targetList,d)
evidList = np.array(evidList)/np.sum(np.array(evidList))
inds = np.argsort(-evidList)
print "\n\nList of AAPs and Evidences:"
quality = np.zeros((N,))
for it,ind in enumerate(inds):
    omega = axisOmegaList[ind]
    proj = np.zeros((X.shape[0],2))
    proj[omega[0],0] = 1
    proj[omega[1],1] = 1
    emb = proj.T.dot(X)
    quality = np.maximum(quality,compPR(X,emb,nSize,factor))
    plt.figure(1)
    plt.scatter(emb[0,:],emb[1,:],marker='o',c=y,alpha=0.7,s=20,vmin=0,vmax=1,cmap=plt.get_cmap('jet'))
    plt.xlabel('var'+str(omega[0]))
    plt.ylabel('var'+str(omega[1]))
    plt.savefig('results/' + dSet + '/decomp_multiple_' + embMethod + '/' + 'axis_align_emb'+ str(it) +'.pdf')
    plt.close()
    print "AAP %d - [%d %d] - Evidence = %f and Quality = %f" % (it, omega[0], omega[1],evidList[ind], np.mean(quality))

fig, ax = plt.subplots(figsize=(8,6))
notnd1,binsL,notnd2 = ax.hist(qualityTrue, bins= np.arange(0,1,0.05), color='blue', normed=True, alpha=0.4)
ax.hist(quality,bins=binsL,normed=True, color='salmon',alpha=0.5)
plt.legend(['Linear','Axis-Aligned'],fontsize=20,loc='best')
ax.set_ylim(bottom=0)
plt.xlabel('Embedding Quality', fontsize=20)
for label in ax.xaxis.get_ticklabels()[::2]:
    label.set_visible(False)

plt.savefig('results/' + dSet + '/decomp_multiple_' + embMethod + '/' + 'qualityhist.pdf')
plt.close()
