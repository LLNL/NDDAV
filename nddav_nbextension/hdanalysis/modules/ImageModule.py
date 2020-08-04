from .Module import *

class ImageModule(Module):

    def __init__(self,parent=None):
        # print "PlotModule.__init__"

        super(ImageModule,self).__init__(parent)

        self.makeInputPort("data", HDData)

        self.makeInputPort("function", HDFunction)
        self.makeInputPort("seg", HDSegmentation)
        self.makeInputPort("embedding", HDEmbedding)

        self.makeSharedValue("highlight",int(-1))
        self.makeSharedValue("subselection",np.array([-1],dtype=np.int32))

        # all set of images
        self.makeSharedValue("images",np.array([],dtype=np.float32))

        # single image
        self.makeSharedValue("image",np.array([],dtype=np.float32))
        # self.makeSharedValue("aggregatedImage",np.array([-1],dtype=np.float32))

        # select images
        self.makeSharedValue("selectedImages",np.array([],dtype=np.float32))

    def imageLookup(self, indices):
        images = self.images.get()
        print (images.shape, " indices len: ",len(indices))
        if len(indices) == 1 and indices[0] != -1:
            # print indices
            self.image.set(images[indices[0],:])
        elif len(indices)>1:
            selectedImages = images[indices,:]
            # print "selectImages:", selectedImages.shape
            varImage = np.var(selectedImages, axis=0)
            # print varImage.shape, np.min(varImage), np.max(varImage)
            varImage = varImage/np.max(varImage)
            meanImage = np.mean(selectedImages, axis=0)
            # meanImage.reshape((1,len(meanImage.flatten())))
            # varImage.reshape((1,len(varImage.flatten())))
            # print meanImage.shape, varImage.shape
            selectedImages = np.vstack( (meanImage,varImage,selectedImages[0:30,:]))
            print ("############ aggImage:", selectedImages.shape)
            self.selectedImages.set(selectedImages)
            #### image aggregation ####
