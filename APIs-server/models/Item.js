var mongoose = require('mongoose')
var mongoosePaginate = require('../pluginMongoose/paginate');
var Schema = mongoose.Schema
var fs = require("fs");
const uuidv1 = require('uuid/v1');


var ItemSchema = new Schema({
    nombre: String,
    precio: Number,
    descripcion: String,
    imagenesNames: [String],
    localizacion: {},
    catalogoName: String,
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    usuarioNombre:String, 

    vendido: { type: Boolean, default: false },
    enVenta: { type: Boolean, default: true },


    fechaPublicada: { type: Date },
    fechaVendida: { type: Date },
    fechaActualizada: { type: Date },
    venderRapido: { type: Boolean, default: false }
});

ItemSchema.statics.createNuevo = async function (req) {

    const imagenes = req.body.imagenes;

    var i = 0;
    var imagenTemp = null;

    var imagenesNames = [];

    for (i = 0; imagenes != null && i < imagenes.length; i++) {
        imagenTemp = imagenes[i];
        var name = null;
        try {
            name = await base64ToImage(imagenTemp);
            //console.log(name);
            imagenesNames.push(name);
        }
        catch (err) {
            // console.log(err);
            throw {
                code: 1,
                msg: "服务器存储照片出现问题, 请稍后再试"
            }
        }
    }
    var nuevo = {
        "nombre": req.body.nombre,
        "precio": req.body.precio,
        "descripcion": req.body.descripcion,
        "imagenesNames": imagenesNames,
        "localizacion": "",
        "catalogoName": req.body.catalogoName,
        "usuario": req.session.userID,
        "usuarioNombre": req.userLogueado.displayName
    }
    var creado = await this.create(nuevo);

    return creado; // devuelve a promise with resolved value(userCreado)
}

ItemSchema.statics.eliminarPorID = async function (itemID) {
    var item = await this.findById(itemID);
    if (item == null) {
        return false;
    } else {
        for (var name of item.imagenesNames) {
            removeFile(name); // remove all files
        }

        var writeResult = await this.deleteOne({ _id: itemID });
        if (writeResult.n > 0 && writeResult.ok == 1) {
            return true;
        } else {
            return false;
        }
    }
}

ItemSchema.statics.modificarPorID = async function (req) {

    const imagenes = req.body.imagenes;
    var i = 0; var imagenTemp = null;
    var imagenesNames = [];
    for (i = 0; imagenes != null && i < imagenes.length; i++) {
        imagenTemp = imagenes[i];
        try {
            var name = await base64ToImage(imagenTemp);
            //console.log("filename" + name);
            imagenesNames.push(name);
        }
        catch (err) {
            // console.log(err);
            throw {
                code: 1,
                msg: "服务器存储照片出现问题, 请稍后再试"
            }
        }
    }

    var modificado = {
        "nombre": req.body.nombre,
        "precio": req.body.precio,
        "descripcion": req.body.descripcion,
        "imagenesNames": imagenesNames,
        "localizacion": "",
        "catalogoName": req.body.catalogoName,
        "usuario": req.session.userId
    }

    var itemAModificarID = req.body.id
    var instancia = await this.findById(itemAModificarID);
    if (instancia == null) {
        return false;
    } else {
        for (var name of instancia.imagenesNames) {
            removeFile(name); // remove all files
        }

        instancia.nombre = modificado.nombre
        instancia.precio = modificado.precio
        instancia.descripcion = modificado.descripcion
        instancia.imagenesNames = modificado.imagenesNames
        instancia.localizacion = modificado.localizacion
        instancia.catalogoName = modificado.catalogoName
        instancia.usuario = modificado.usuario

        var saved = await instancia.save();
        if (saved == null) {
            return false;
        } else {
            return true;
        }
    }
}
ItemSchema.statics.obtenerPorID = async function (itemID) {
    var item = await this.findById(itemID);

    return item;
}

ItemSchema.methods.setearComoVendido = async function () {
    this.vendido = true;
    this.fechaVendida = new Date();
    this.enVenta = false;

    var saved = await this.save()
    //console.log(saved);
    if (saved == null) {
        return false;
    } else {
        return true;
    }
}



// https://stackoverflow.com/questions/12669615/add-created-at-and-updated-at-fields-to-mongoose-schemas
ItemSchema.pre('save', function (next) {
    now = new Date();
    this.fechaActualizada = now;
    if (!this.fechaPublicada) {
        this.fechaPublicada = now;
    }
    next();
});

ItemSchema.pre('update', function () {
    this.update({}, { $set: { fechaActualizada: new Date() } });
});

ItemSchema.plugin(mongoosePaginate);

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


async function base64ToImage(base64Data) {
    var procesado = null
    procesado = base64Data.replace(/^data:image\/png;base64,/, "")
    //console.log(procesado);
    var rootPath = process.cwd() + '/uploaded/imagenes/';

    var date = new Date();
    var time = date.getTime() + 1000000;


    var fileName = uuidv1();
    await fs.writeFile(rootPath + fileName + ".jpg", procesado, 'base64');

    return fileName;
}


var Item = mongoose.model('Item', ItemSchema);

module.exports = Item;