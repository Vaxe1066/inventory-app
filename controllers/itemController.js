
const { body,validationResult } = require('express-validator');
var Item = require('../models/item');
var Category = require('../models/category');


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

// Display list of all items.
exports.item_list = function(req, res) {
    Item.find()
    .sort([['item']])
    .exec(function (err, list_items) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('items_list', { title: 'All Items', item_list: list_items });
    });
};

// Display detail page for a specific item.
exports.item_detail = function(req, res) {
    Item.findById(req.params.id)
    .populate('category')
    .exec(function (err, result) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('items_detail', { title: 'Item Details', 
                                    item_list: result });
    });
};

// Display item create form on GET.
exports.item_create_get = function(req, res, next) {
    Category.find()
    .sort([['category']])
    .exec(function (err, result){
        if(err){return next(err);}
        //successful so render
        res.render('item_form', {title: 'Create New Item', categories: result})
    });
};

// Handle item create on POST.
exports.item_create_post = [

    // Validate and sanitise fields.
    body('itemname','Item Name must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('description', 'Description must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('category', 'category must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('price', 'price must not be empty').trim().isLength({ min: 1 }).escape(),
    body('stock', 'stock must not be empty').trim().isLength({ min: 1 }).escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.
            Category.find()
            .sort([['category']])
            .exec(function (err, result){
                if(err){return next(err);}
                //successful so render
                res.render('item_form', {title: 'Create New Item', categories: result, item:req.body, errors: errors.array()})
            });
            return;
        }
        else {
            var img = fs.readFileSync(req.file.path);
            var encode_image = img.toString('base64');

            var item = new Item(
                { item: req.body.itemname,
                    description: req.body.description,
                    category: req.body.category,
                    price: req.body.price,
                    number_in_stock: req.body.stock,
                    contentType: req.file.mimetype,
                    image: encode_image
                    });
            // Data from form is valid. Save book.
            item.save(function (err) {
                if (err) { return next(err); }
                //successful - redirect to new book record.
                res.redirect(item.url);
                });
        }
    }
];


// Display item delete form on GET.
exports.item_delete_get = function(req, res, next) {
    Item.findById(req.params.id)
    .populate('category')
    .exec(function (err, result) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('item_delete', { title: 'Delete Item', item_list: result });
    });
};

// Handle item delete on POST.
exports.item_delete_post = function(req, res) {
    Item.findByIdAndRemove(req.body.itemid, function deleteItem(err) {
        if (err) { return next(err); }
        // Success - go to author list
        res.redirect('/catalog/items')
    })
};

// Display item update form on GET.
exports.item_update_get = function(req, res, next) {

    async.parallel({
        category: function(callback){
            Category.find().exec(callback);
        },
        item: function(callback){
            Item.findById(req.params.id).exec(callback);
        },
        }, function(err, results){
            if (err) { return next(err); }
            if (results.item==null) { // No results.
                var err = new Error('Item not found');
                err.status = 404;
                return next(err);
            }
            res.render('item_form', {title: 'Update Item', item: results.item, categories: results.category})
        }
    );



};

// Handle item update on POST.
exports.item_update_post = [

    // Validate and sanitise fields.
    body('itemname','Item Name must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('description', 'Description must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('category', 'category must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('price', 'price must not be empty').trim().isLength({ min: 1 }).escape(),
    body('stock', 'stock must not be empty').trim().isLength({ min: 1 }).escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.
            Category.find()
            .sort([['category']])
            .exec(function (err, result){
                if(err){return next(err);}
                //successful so render
                res.render('item_form', {title: 'Create New Item', categories: result, item:req.body, errors: errors.array()})
            });
            return;
        }
        else {
            var img = fs.readFileSync(req.file.path);
            var encode_image = img.toString('base64');
            var item = new Item(
                { item: req.body.itemname,
                    description: req.body.description,
                    category: req.body.category,
                    price: req.body.price,
                    number_in_stock: req.body.stock,
                    contentType: req.file.mimetype,
                    image: encode_image,
                    _id: req.params.id
                    });
            // Data from form is valid. Save book.
            Item.findByIdAndUpdate(req.params.id, item, {}, function (err,theitem) {
                if (err) { return next(err); }
                   // Successful - redirect to book detail page.
                   res.redirect(theitem.url);
                });
        }
    }
];