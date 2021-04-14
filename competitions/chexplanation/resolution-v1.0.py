def load_and_resize_img(path):
    """
    Load and convert the full resolution images on CodaLab to
    low resolution used in the small dataset.
    """
    img = cv2.imread(path, 0) 

    size = img.shape
    max_dim = max(size)
    max_ind = size.index(max_dim)
    
    if max_ind == 0:
        # width fixed at 320
        wpercent = (320 / float(size[0]))
        hsize = int((size[1] * wpercent))
        new_size = (hsize, 320)
    
    else:
        # height fixed at 320
        hpercent = (320 / float(size[1]))
        wsize = int((size[0] * hpercent))
        new_size = (320, wsize)

    resized_img = cv2.resize(img, new_size)

    return resized_img
