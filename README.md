nddav_nbextension
===============================

An edit of NDDAV to allow Jupyter notebook compatibility

Launch using 

    $ ./launch_app.sh
    
the stuff below this is just autogenerated boilerplate.
    
Installation
------------

To install use pip:

    $ pip install nddav_nbextension
    $ jupyter nbextension enable --py --sys-prefix nddav_nbextension

To install for jupyterlab

    $ jupyter labextension install nddav_nbextension

For a development installation (requires npm),

    $ git clone https://github.com/edrobina/nddav_nbextension.git
    $ cd nddav_nbextension
    $ pip install -e .
    $ jupyter nbextension install --py --symlink --sys-prefix nddav_nbextension
    $ jupyter nbextension enable --py --sys-prefix nddav_nbextension
    $ jupyter labextension install js

When actively developing your extension, build Jupyter Lab with the command:

    $ jupyter lab --watch

This takes a minute or so to get started, but then automatically rebuilds JupyterLab when your javascript changes.

Note on first `jupyter lab --watch`, you may need to touch a file to get Jupyter Lab to open.

