if [ -d "/nddav_extension/static" ]; then
    jupyter nbextension uninstall --py --sys-prefix nddav_nbextension \
    && rm -rf nddav_nbextension/static \
    && python3 setup.py build \
    && pip3 install -e . \
    && jupyter nbextension install --py --symlink --sys-prefix nddav_nbextension \
    && jupyter nbextension enable nddav_nbextension --py --sys-prefix \
    && jupyter notebook
else
    python3 setup.py build \
    && pip3 install -e . \
    && jupyter nbextension install --py --symlink --sys-prefix nddav_nbextension \
    && jupyter nbextension enable nddav_nbextension --py --sys-prefix \
    && jupyter notebook
fi
