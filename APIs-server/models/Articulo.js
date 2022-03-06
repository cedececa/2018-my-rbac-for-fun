var mongoose = require('mongoose')
var mongoosePaginate = require('../pluginMongoose/paginate');
var Schema = mongoose.Schema

// label & description
var ldSchema = new Schema({
    labelName: String,
    labelDescription: String
});

var articuloSchema = new Schema({
    nombre: { type: String, unique: true },
    LDs: [ldSchema],
    creada: { type: Date },
    actualizada: { type: Date },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});


// https://stackoverflow.com/questions/12669615/add-created-at-and-updated-at-fields-to-mongoose-schemas
articuloSchema.pre('save', function (next) {
    now = new Date();
    this.actualizada = now;
    if (!this.created_at) {
        this.creada = now;
    }
    next();
});

articuloSchema.pre('update', function () {
    this.update({}, { $set: { actualizada: new Date() } });
});

articuloSchema.plugin(mongoosePaginate);

var Articulo = mongoose.model('Articulo', articuloSchema);

module.exports = Articulo;