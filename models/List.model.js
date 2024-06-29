var mongoose = require('mongoose');

var ListSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    idMovies: [{
        type: String
    }]
});

const List = mongoose.model('List', ListSchema);

module.exports = List;
