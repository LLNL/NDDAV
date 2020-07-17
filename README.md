nddav_nbextension
===============================

An edit of [https://github.com/LLNL/NDDAV](NDDAV) to allow Jupyter notebook compatibility in addition to web app functionality. Tutorials for Jupyter notebook can be found in the [https://github.com/edrobina/nddav_nbextension/tree/master/tutorials](tutorials/) directory.

Requirements before installation:

1. Install ANN 1.1.2: https://www.cs.umd.edu/~mount/ANN/
2. Install hdtopology: https://github.com/LLNL/hdtopology
3. Install required python packages:

    
    ```pip install -r requirements.txt```

To install as a notebook extension:

    python setup.py build
    pip install -e . 
    jupyter nbextension install --py --symlink --sys-prefix nddav_nbextension 
    jupyter nbextension enable nddav_nbextension --py --sys-prefix 

To run as a web page:

    python3 nddavServer.py --port=#### --layout=/path/to/json


