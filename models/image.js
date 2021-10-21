const mongoose = require('mongoose');

const Schema=mongoose.Schema;

const ImageSchema = new Schema(
    {
        image: {type: Buffer},
    }
);


ImageSchema
.virtual('url')
.get(function () {
    return '/catalog/image/' + this._id;
});


module.exports = mongoose.model('Image', ImageSchema);