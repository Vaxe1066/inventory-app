const { body,validationResult } = require('express-validator');

var Category = require('../models/category');
var Item = require('../models/item');

var async = require('async');



exports.index = function(req, res) {
    Category.find()
    .sort([['category']])
    .exec(function (err, list_categories) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('category_list', { title: 'All Categories', category_list: list_categories });
    });
};

// Display list of all categorys.
exports.category_list = function(req, res) {
    //res.send('NOT IMPLEMENTED: category list');
    res.redirect('/catalog/')
};

// Display detail page for a specific category.
exports.category_detail = function(req, res) {
    async.parallel({
        category: function(callback) {
            Category.findById(req.params.id)
              .exec(callback);
        },

        category_items: function(callback) {
            Item.find({ 'category': req.params.id })
              .exec(callback);
        },

    }, function(err, results) {
        if (err) { return next(err); }
        if (results.category==null) { // No results.
            var err = new Error('category not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render
        res.render('category_detail', { title: 'Category Detail', category: results.category, category_items: results.category_items } );
    });
};

// Display category create form on GET.
exports.category_create_get = function(req, res) {
    res.render('category_form', { title: 'Create Category' });
};

// Handle category create on POST.
exports.category_create_post = [

    // Validate and santize the name field.
    body('name', 'Category field required').trim().isLength({ min: 1 }).escape(),
  
    // Process request after validation and sanitization.
    (req, res, next) => {
  
      // Extract the validation errors from a request.
      const errors = validationResult(req);
  
      // Create a genre object with escaped and trimmed data.
      var category = new Category(
        { category: req.body.name }
      );
  
      if (!errors.isEmpty()) {
        // There are errors. Render the form again with sanitized values/error messages.
        res.render('category_form', { title: 'Create Category', category: category, errors: errors.array()});
        return;
      }
      else {
        // Data from form is valid.
        // Check if Genre with same name already exists.
        Category.findOne({ 'category': req.body.name })
          .exec( function(err, found_cat) {
             if (err) { return next(err); }
  
             if (found_cat) {
               // Genre exists, redirect to its detail page.
               res.redirect(found_cat.url);
             }
             else {
  
               category.save(function (err) {
                 if (err) { return next(err); }
                 // Genre saved. Redirect to genre detail page.
                 res.redirect(category.url);
               });
  
             }
  
           });
      }
    }
  ];



// Display category delete form on GET.
exports.category_delete_get = function(req, res) {
  async.parallel({
    category: function(callback) {
      Category.findById(req.params.id).exec(callback)
    },
    items: function(callback) {
      Item.find({ 'category': req.params.id }).exec(callback)
    },
}, function(err, results) {
    if (err) { return next(err); }
    if (results.category==null) { // No results.
        res.redirect('/catalog/categories');
    }
    // Successful, so render.
    res.render('category_delete', { title: 'Delete Category', category: results.category, items_list: results.items } );
});

};

// Handle category delete on POST.
exports.category_delete_post = function(req, res) {
  async.parallel({
    category: function(callback) {
      Category.findById(req.params.id).exec(callback)
    },
    items: function(callback) {
      Item.find({ 'category': req.params.id }).exec(callback)
    },
  }, function(err, results) {
      if (err) { return next(err); }
      if (results.items.length>0 ) { 
        res.render('category_delete', { title: 'Delete Category', category: results.category, items_list: results.items } );
        return;
      }
      else {
        Category.findByIdAndRemove(req.body.categoryid, function deleteCategory(err) {
          if (err) { return next(err); }
          // Success - go to author list
          res.redirect('/catalog/categories')
      })
      }

  });
};

// Display category update form on GET.
exports.category_update_get = function(req, res) {
  Category.findById(req.params.id)
  .exec(function (err, result) {
    if (err) { return next(err); }
    //Successful, so render
    res.render('category_form', { title: 'Update Category', category: result });
  });
};

// Handle category update on POST.
exports.category_update_post = [

  // Validate and santize the name field.
  body('name', 'Category field required').trim().isLength({ min: 1 }).escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {

    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a genre object with escaped and trimmed data.
    var category = new Category(
      { category: req.body.name,
        _id:req.params.id }
    );

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render('category_form', { title: 'Create Category', category: category, errors: errors.array()});
      return;
    }
    else {
      // Data from form is valid.
      // Check if Genre with same name already exists.
      Category.findOne({ 'category': req.body.name })
        .exec( function(err, found_cat) {
           if (err) { return next(err); }

           if (found_cat) {
             // Genre exists, redirect to its detail page.
             res.redirect(found_cat.url);
           }
           else {
             Category.findByIdAndUpdate(req.params.id, category, {}, function (err,thecategory) {
              if (err) { return next(err); }
                  // Successful - redirect to book detail page.
                  res.redirect(thecategory.url);
              });

           }

         });
    }
  }
];
