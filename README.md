# NDDAV
Web-based Interface for the N-Dimensional Data Analysis and Visualization System.

#### Requirements:
python3, numpy, scipy, sklearn, flask, python-socketio, eventlet, pyclipper, graphviz (both binary executable and python wrapper)

Topological data analysis library for NDDAV: hdtopology (https://github.com/LLNL/hdtopology.git)

#### Install:
1. Install hdtopology (https://github.com/LLNL/hdtopology.git).

2. Install graphviz binary package (i.e., brew install graphviz)

3. Install required python packages:
```console
pip install -r requirements.txt
```

#### Run:

Start server:
```console
python3 nddavServer.py
```

Open browser at: http://localhost:5000


Released under LLNL-CODE-772013
