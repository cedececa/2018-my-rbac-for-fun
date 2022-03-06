var mongoose = require('mongoose')
var Schema = mongoose.Schema


// label & description
var API_Schema = new Schema({
    method: String,
    path: String,
    value: String
});

API_Schema.statics.getAllAPIs = async function () {
    var query = this.find();
    var promise = query.exec();
    var apis = await promise;
    if (apis && apis.length) {
        return apis;
    }

    throw "No APIs";
}

API_Schema.statics.getOperacionByPathAndmethod = async function (methodNombre, pathNombre) {
    var api = await this.findOne({ method: methodNombre, path: pathNombre }).exec();
    if (api == null) {
        throw "No existe este api [ " + methodNombre + " ] " + " [ " + pathNombre + " ]"
    }

    return api;
}

API_Schema.statics.getOperacionByID = async function (id) {
    var api = this.findById(id).exec();
    if (api == null) {
        "No existe este api [ " + methodNombre + " ] " + " [ " + pathNombre + " ]"
    }
    return api;
}

API_Schema.statics.siExistePorMethodYPath = async function (method1, path1) {
    var promise = this.findOne({ method: method1, path: path1 }).exec();
    var api = await promise;

    var result = false;
    if (api == null) {
        result = false;
    } else {
        result = true;
    }
    //console.log(result);
    return result;
}

API_Schema.statics.siExistePorID = async function (id) {
    var api = await this.find({ _id: id });
    if (api == null) {
        return false;
    } else {
        return true;
    }
}

API_Schema.statics.crearUnaOperacion = async function (methodNombre, pathNombre) {
    console.log(methodNombre);
    if(Array.isArray(methodNombre)){
        methodNombre = methodNombre[0];
    }
    var promise = this.create({
        method: methodNombre, path: pathNombre, value: methodNombre+pathNombre
    });

    var apiCreado = await promise;
    if (apiCreado == null) {
        throw "existe este api " + methodNombre + " " + pathNombre
    }

    return apiCreado;
}

API_Schema.statics.eliminarUnaOperacionPorID = async function (id) {
    var writeOpResult = await this.deleteOne({ _id: id })
    if (writeOpResult.n > 0 && writeOpResult.ok == 1) {
        return true;
    } else {
        return false;
    }
}

API_Schema.statics.eliminarUnaOperacionPormethodNombreAndPathNombre = async function (methodNombre, pathNombre) {
    var writeOpResult = await this.deleteOne({ method: methodNombre, path: pathNombre })
    if (writeOpResult.n > 0 && writeOpResult.ok == 1) {
        return true;
    } else {
        return false;
    }
}

var API = mongoose.model('API', API_Schema);

module.exports = API;