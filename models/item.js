const mongoose = require('mongoose');

const Schema=mongoose.Schema;

const ItemSchema = new Schema(
    {
        item: {type: String, required: true, maxLength: 500},
        description: {type: String, maxLength: 500},
        category: {type: Schema.Types.ObjectId, ref: 'Category'},
        price: {type: Number, min: 0, default: 0},
        number_in_stock: {type: Number, min: 0, default: 0},
        image: {type: Buffer}
        
    }
);


ItemSchema
.virtual('url')
.get(function () {
    return '/catalog/item/' +this._id;
});

ItemSchema
.virtual('price_formatted')
.get(function () {
    return '£'+this.price;
});


module.exports = mongoose.model('Item', ItemSchema);