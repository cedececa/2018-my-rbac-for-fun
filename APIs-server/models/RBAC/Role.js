var mongoose = require('mongoose')
var Schema = mongoose.Schema
var mongoosePaginate = require('../../pluginMongoose/paginate');


// label & description
var roleSchema = new Schema({
    roleName: { type: String, unique: true },
    APIsPermitidos: [{
        method: String, path: String, value: String
    }],
    creada: { type: Date },
    actualizada: { type: Date }
});

roleSchema.pre('save', function (next) {
    now = new Date();
    this.actualizada = now;
    if (!this.created) {
        this.creada = now;
    }
    next();
});

roleSchema.pre('update', function () {
    this.update({}, { $set: { actualizada: new Date() } });
});


roleSchema.statics.createRole = async function (roleNuevo) {
    var objetoCreado = await this.create(roleNuevo);
    if (objetoCreado == null) {
        throw "no se ha creado";
    }

    return objetoCreado;
}

roleSchema.statics.existeRolePorNombre = async function (name) {
    var role = await this.findOne({ "roleName": name });
    if (role == null) {
        // doc may be null if no document matched
        return false;
    } else {
        return true;
    }
}

roleSchema.statics.getRoleByName = async function (name) {
    var role = await this.findOne({ "roleName": name });
    if (role == null) {
        throw "No existe este role [ " + name + " ]"
    }
    return role;
}
roleSchema.statics.getRoleByID = async function (id) {
    var role = await this.findOne({ _id: id });
    if (role == null) {
        throw "no existe este role ";
    }
    return role;
}

// solo para el roles root|administrador
roleSchema.statics.modificarRolePorID = async function (id, roleNuevo) {
    //console.log(id);

    var role = await this.getRoleByID(id);
    role.roleName = roleNuevo.roleName;
    role.APIsPermitidos = roleNuevo.APIsPermitidos;

    await role.save();

    return role;
}

roleSchema.statics.getAllRoles = async function () {
    var query = this.find();
    var promise = query.exec();
    var roles = await promise;
    if (roles && roles.length) {
        return roles;
    }

    throw "No Roles";
}
roleSchema.statics.eliminarPorID = async function (id) {
    var role = await this.findById(id);
    if (role == null) {
        return false;
    }

    // 删除 该 id role之后， 要删除 它的 所有的 articulos
    var writeResult = await this.deleteOne({ _id: id });
    if (writeResult.n > 0 && writeResult.ok == 1) {
        return true;
    } else {
        return false;
    }
};

var API = require("./API");
roleSchema.methods.addApiPermitidoPorMethodAndPath = async function (methodNombre, pathNombre) {

    var api = await API.siExistePorMethodYPath(methodNombre, pathNombre);

    if (this.siTengoEsteAPI(methodNombre, pathNombre)) {
        throw "ya tiene esta operacion "
    } else {
        this.APIsPermitidos.push({ "method": methodNombre, "path": pathNombre, "value": methodNombre + pathNombre });
        try {
            await this.save();
        } catch (err) {
            throw "no se ha hecho correctamente por error"
        }
        return this;    // se ha añadido correcatmente y devolvemos el role
    }
}

// 更新 自己的 role 的 apis， 如果 存在 在 DB API Collection 里, 删除 那些 不 存在的
roleSchema.methods.actualizarLosAPIS = async function () {
    var apis = this.APIsPermitidos;

    if (apis.length > 0) {
        var api = null;
        var i = 0;
        for (; i < apis.length; i++) {
            api = apis[i];
            var r = await API.siExistePorMethodYPath(api.method, api.path);
            if (!r) { // 如果 api 不 存在 在 DB 里， 则 删除
                this.APIsPermitidos.pull(api);
            }
        }
        this.save();
    }

    return this;
}

roleSchema.methods.eliminaAPIPorTipoAndPath = async function (tipoNombre, pathNombre) {
    var api = await API.getOperacionByPathAndTipo(tipoNombre, pathNombre);
    if (!this.siTengoEsteAPI(methodNombre, pathNombre)) {

        throw "no tiene esta operacion"

    } else {
        this.APIsPermitidos.pull(operacion);
        try {
            await this.save();
        } catch (err) {
            throw "no se ha hecho correctamente por error"
        }
        return this;    // se ha añadido correcatmente y devolvemos el role
    }
}


roleSchema.methods.siTengoEsteAPI = function (method, path) {
    var misApis = this.APIsPermitidos;
    var miApi = null;
    var encontrado = false;
    for (var i = 0; i < misApis.length && encontrado == false; i++) {
        miApi = misApis[i];
        if (miApi.method == method && miApi.path == path) {
            encontrado = true;
        }
    }

    return encontrado;
}

roleSchema.methods.siTengoEsteAPIParaComprobacionRegexp = function (method, path) {
    var misApis = this.APIsPermitidos;
    var miApi = null;
    var encontrado = false;

    for (var i = 0; i < misApis.length && encontrado == false; i++) {
        miApi = misApis[i];

        if (
            miApi.method == method &&
            miApi.path == path
        ) {
            encontrado = true;
        }
    }
    //console.log(encontrado);
    return encontrado;
}

roleSchema.methods.getAPIsPermitidos = async function () {
    var apisPermitidos = await this.populate({ path: 'APIsPermitidos' })

    return apisPermitidos;
}

roleSchema.plugin(mongoosePaginate);


var Role = mongoose.model('Role', roleSchema);
module.exports = Role;



