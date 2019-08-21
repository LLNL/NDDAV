

class HDDataObject(object):
    """The baseclass for all data in the system."""

    def __init__(self,obj=None):
        super(HDDataObject,self).__init__()
        # print "========== HDDataObject.__init__() ============="
        
        if obj is None or not isinstance(obj,HDDataObject):
            # print " name: Default "
            self.name = "Default"
        else:
            # print " obj: ", obj.name
            self.name = obj.name

            
