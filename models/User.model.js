var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var ListSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    idMovies: [{
        type: String
    }]
});

var UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    date: { 
        type: Date, 
        default: Date.now 
    },
    lists: {
        type: [ListSchema],
        default: [
            { _id: 'por-ver', title: 'Por ver', idMovies: [] },
            { _id: 'vistas', title: 'Vistas', idMovies: [] },
            { _id: 'favoritas', title: 'Favoritas', idMovies: [] }
        ]
    }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
