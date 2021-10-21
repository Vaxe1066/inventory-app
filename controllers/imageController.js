const multer  = require('multer')
const fs = require('fs-extra')
   

var Image = require('../models/image');
var Item = require('../models/item');


var async = require('async');;
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

exports.image_upload_get = function(req, res) {
    res.render('image_form');
};

exports.image_upload_post = function(req, res, next) {
    //console.log(req.file)
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

};



exports.image_detail = function(req, res, next) {
    async.parallel({
        image: function(callback) {
            Image.findById(req.params.id)
              .exec(callback);
        },

    }, function(err, results) {
        if (err) { return next(err); }
        if (results.image==null) { // No results.
            var err = new Error('image not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render
        //res.contentType('image/jpg');
        //res.send(results.image.buffer);
        //res.send(results);
        res.render('image_detail', { title: 'Image', image: results.image } );
    });
};