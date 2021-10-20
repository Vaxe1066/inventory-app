#! /usr/bin/env node

console.log('This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var Category = require('./models/category')
var Item = require('./models/item')



var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var categories = []
var items = []


function categoryCreate(category, description, cb) {

  categoryDetail = {category: category , description: description}
  
  var category = new Category(categoryDetail);
       
  category.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Category: ' + category);
    categories.push(category)
    cb(null, category)
  }  );
}

function itemCreate(item, description, category, price, number_in_stock, cb) {
  var item = new Item(
      {
           item: item,
           description: description,
           category, category,
           price: price,
           number_in_stock: number_in_stock
      }
    );
       
    item.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New item: ' + item);
    items.push(item)
    cb(null, item);
  }   );
}



function createCategories(cb) {
    async.parallel([
        function(callback) {
            categoryCreate('Crisps', 'Indulge in Britains greatest snack', callback);
        },
        function(callback) {
            categoryCreate('Fruit and Veg', 'Finest selction of Healthy food - part of your 5 a day!', callback)
        }
        ],
        // optional callback
        cb);
}


function createItems(cb) {
    async.parallel([
        function(callback) {
            itemCreate('Jazz Apples', 'Sourced from Somerset', categories[1],'1.49', '20', callback)
        },
        function(callback) {
            itemCreate('Cheese n Onion x6', 'Gary Liniker LC You Know', categories[0],'1.25', '100', callback)
        }
        ],
        // Optional callback
        cb);
}



async.series([
    createCategories,
    createItems

],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    // All done, disconnect from database
    mongoose.connection.close();
});