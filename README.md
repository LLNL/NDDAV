nddav_nbextension
===============================

An edit of NDDAV to allow Jupyter notebook compatibility.

To install:

1. Install ANN 1.1.2: https://www.cs.umd.edu/~mount/ANN/
2. Install hdtopology: https://github.com/LLNL/hdtopology
3. Install required python packages:

    
    ```pip install -r requirements.txt```

To use as a notebook extension:

    ./launch_app.sh

To run as a web page:

    python3 nddavServer.py --port=#### --layout=/path/to/json


