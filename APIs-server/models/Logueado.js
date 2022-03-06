var mongoose = require('mongoose')
var Schema = mongoose.Schema
var bcrypt = require('bcrypt-nodejs');
var mongoosePaginate = require('../../pluginMongoose/paginate');


// label & description
var logueadoSchema = new Schema({
    displayName: { type: String, unique: true },
    local: {
        email: { type: String, unique: true },
        password: String
    },
    facebook: {
        id: String,
        token: String,
        name: String,
        email: String
    },
    twitter: {
        id: String,
        token: String,
        displayName: String,
        username: String
    },
    google: {
        id: String,
        token: String,
        email: String,
        name: String
    },
    informacionPersonal: {
        telefono: String,
        pais: String,
        nacionalidad: String
    }
});


logueadoSchema.plugin(mongoosePaginate);

var User = mongoose.model('logueado', logueadoSchema);

module.exports = User;