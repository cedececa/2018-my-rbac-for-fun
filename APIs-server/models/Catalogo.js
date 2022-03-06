var mongoose = require('mongoose')
var mongoosePaginate = require('../pluginMongoose/paginate');
var Schema = mongoose.Schema
var fs = require("fs");

var catalogoSchema = new Schema({
    nombre: { type: String, unique: true },
    descripcion: String,
    imagenName: String,
    creada: { type: Date },
    actualizada: { type: Date },
});

// https://stackoverflow.com/questions/12669615/add-created-at-and-updated-at-fields-to-mongoose-schemas
catalogoSchema.pre('save', function (next) {
    now = new Date();
    this.actualizada = now;
    if (!this.creada) {
        this.creada = now;
    }
    next();
});

catalogoSchema.pre('update', function () {
    this.update({}, { $set: { actualizada: new Date() } });
});

catalogoSchema.statics.createNuevo = async function (nuevo) {
    var creado = await this.create(nuevo);
    return creado; // devuelve a promise with resolved value(userCreado)
}

catalogoSchema.statics.eliminarPorID = async function (id) {
    var instancia = await this.findById(id);
    if (instancia == null) {
        return false;
    } else {
        for (var name of instancia.imagenName) {
            removeFile(name); // remove all files
        }

        var writeResult = await this.deleteOne({ _id: id });
        if (writeResult.n > 0 && writeResult.ok == 1) {
            return true;
        } else {
            return false;
        }
    }
}
catalogoSchema.statics.eliminarPorNombre = async function (nombre) {
    var instancia = await this.findOne({ "nombre": nombre }).exec();
    if (instancia == null) {
        return false;
    } else {
        for (var name of instancia.imagenName) {
            removeFile(name+".jpg"); // remove all files
        }

        var writeResult = await this.deleteOne({ "nombre": nombre });
        if (writeResult.n > 0 && writeResult.ok == 1) {
            return true;
        } else {
            return false;
        }
    }
}

catalogoSchema.statics.siExiste = async function (catalogoName) {
    var instancia = await this.findOne({ "nombre": catalogoName }).exec();
    if (instancia != null) {
        return true;
    } else {
        return false;
    }
}

catalogoSchema.methods.modificar = async function (modificado) {

    removeFile(this.imagenName); // remove all files

    this.nombre = modificado.nombre
    this.descripcion = modificado.descripcion
    this.imagenName = modificado.imagenName

    var saved = await this.save();
    if (saved == true) {
        return true;
    } else {
        return false;
    }
}

catalogoSchema.statics.obtenerPorID = async function (id) {
    var instancia = await this.findById(id);
    return instancia;
}
catalogoSchema.statics.obtenerPorNombre = async function (nombre) {
    var instancia = await this.findOne({ "nombre": nombre }).exec();
    return instancia;
}
var path = process.cwd() + '/uploaded/imagenes/';

function removeFile(fileName) {
    return fs.unlink(path + fileName, (err) => {
        if (err) {
            return false;
        } else {
            return true;
        }
    });
}

catalogoSchema.plugin(mongoosePaginate);


var catalogo = mongoose.model('Catalogo', catalogoSchema);

module.exports = catalogo;