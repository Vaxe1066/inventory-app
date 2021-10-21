var express = require('express');
var router = express.Router();
const path = require('path');

// Require controller modules.
var category_controller = require('../controllers/categoryController');
var item_controller = require('../controllers/itemController');
var image_controller = require('../controllers/imageController');


const multer = require('multer');
const fs = require('fs-extra')


// SET STORAGE
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, '../public/images'))
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now())
    }
  })
   
var upload = multer({ storage: storage })
var Image = require('../models/image')


/// CATEGORY ROUTES ///

// GET catalog home page.
router.get('/', category_controller.index);

// GET request for creating a category. NOTE This must come before routes that display category (uses id).
router.get('/category/create', category_controller.category_create_get);

// POST request for creating category.
router.post('/category/create', category_controller.category_create_post);

// GET request to delete category.
router.get('/category/:id/delete', category_controller.category_delete_get);

// POST request to delete category.
router.post('/category/:id/delete', category_controller.category_delete_post);

// GET request to update category.
router.get('/category/:id/update', category_controller.category_update_get);

// POST request to update category.
router.post('/category/:id/update', category_controller.category_update_post);

// GET request for one category.
router.get('/category/:id', category_controller.category_detail);

// GET request for list of all category items.
router.get('/categories', category_controller.category_list);

/// item ROUTES ///

// GET request for creating item. NOTE This must come before route for id (i.e. display item).
router.get('/item/create', item_controller.item_create_get);

// POST request for creating item.
router.post('/item/create',upload.single('avatar'), item_controller.item_create_post);

// GET request to delete item.
router.get('/item/:id/delete', item_controller.item_delete_get);

// POST request to delete item.
router.post('/item/:id/delete', item_controller.item_delete_post);

// GET request to update item.
router.get('/item/:id/update', item_controller.item_update_get);

// POST request to update item.
router.post('/item/:id/update', upload.single('avatar'), item_controller.item_update_post);

// GET request for one item.
router.get('/item/:id', item_controller.item_detail);

// GET request for list of all items.
router.get('/items', item_controller.item_list);





// GET request for creating image. NOTE This must come before route for id (i.e. display item).
//router.get('/image/upload', image_controller.image_upload_get);

// POST request for creating item.
//router.post('/image/upload', upload.single('avatar'), image_controller.image_upload_post);


//router.get('/image/:id', image_controller.image_detail);

// POST request for creating item.


/*
const multer = require('multer');
const fs = require('fs-extra')


// SET STORAGE
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '../public/images')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now())
    }
  })
   
var upload = multer({ storage: storage })
var Image = require('../models/image')

router.post('/image/upload', upload.single('avatar'), (req, res) => {
    var img = fs.readFileSync(req.file.path);
    var encode_image = img.toString('base64');
    // Define a JSONobject for the image attributes for saving to database
 
    var finalImg = new Image ({
        contentType: req.file.mimetype,
        image: encode_image
    });
    finalImg.save(function (err) {
        if (err) { return next(err); }
        // Genre saved. Redirect to genre detail page.
        res.redirect('/');
      });
})
*/

module.exports = router;
