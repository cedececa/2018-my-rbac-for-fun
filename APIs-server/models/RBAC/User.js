var mongoose = require('mongoose')
var Schema = mongoose.Schema
var bcrypt = require('bcrypt');
var mongoosePaginate = require('../../pluginMongoose/paginate');

// label & description
var userSchema = new Schema({
    // https://code.i-harness.com/en/q/796260
    displayName: {
        type: String, trim: true, index: {
            unique: true,
            partialFilterExpression: { displayName: { $type: 'string', default: "未设定" } }
        }
    },
    local: {
        email: { type: String, unique: true },
        password: String,
        salt: String
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
    },
    roles: [String], // un usuario puede tener 0 o muchos roles names
    myArticulos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Articulo' }],
    creada: { type: Date },
    actualizada: { type: Date },

    /*    itemsPosted:[],
       itemsSold:[],
       itemsLiked:[],
       itemsSeen:[] */
/*     itemsPublicados: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }],
    itemsVendidos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }], */
    itemsGustados: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }],
    itemsVistos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }],
    ItemsPublicadosParaVenderRapido: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }]
});

// checking if password is valid
userSchema.methods.validPW = function (password) {
    return bcrypt.compareSync(password, this.local.password);
};

userSchema.statics.generateSalt = function () {
    return bcrypt.genSaltSync(10);
}

userSchema.statics.generateHash = function (password, s) {
    return bcrypt.hashSync(password, s);
};

userSchema.statics.getUserByEmail = async function (email) {
    //console.log(email);
    var promise = this.findOne({ "local.email": email });
    var user = await promise;

    if (user == null) {
        throw {
            code: 1,
            msg: "No existe este user con este email [ " + email + " ]",
            error: new Error(), // 这个 可以 告诉 我们 错误 在 哪里
        };
    }
    return user;
}

var Role = require("./Role");
userSchema.methods.siTieneEsteRoleNames = function (roleName) {
    var i = 0;
    var roleTemp;
    var resultado = false;

    for (
        i;
        i < this.roles.length && resultado == false;
        i++
    ) {
        roleTemp = this.roles[i];
        if (roleTemp.toString() == roleName.toString()) {
            // si existe el mismo role en el array
            resultado = true;
        }
    }
    // 如果 该 user 有 该 role， 返回 真， 否则， 假
    return resultado;
}

userSchema.methods.addRole = async function (roleName) {

    await Role.getRoleByName(roleName); // 如果 这里 不 报错， 则 存在 这个 Role

    if (this.siTieneEsteRoleNames(roleName)) {
        throw "ya tiene este role  [ " + roleName + " ]"
    }

    this.roles.push(roleName);    // si no tiene, añadimos al user

    await this.save();

    return this;
}

userSchema.methods.deleteRole = async function (roleName) {

    if (!this.siTieneEsteRoleNames(roleName)) {
        throw "no tiene este role"
    }

    this.roles.pull(role);
    await this.save();

    return this; // se ha eliminado correctamente
}

userSchema.statics.getUserByName = async function (name) {
    var user = await this.findOne({ displayName: name });
    if (user == null) {
        throw "no existe este usuario "
    }
    return user;
}

userSchema.statics.getUserByID = async function (id) {
    var user = await this.findOne({ _id: id });
    if (user == null) {
        throw "no existe este usuario ";
    }
    return user;
}

// solo para el roles root|administrador
userSchema.statics.modificarUserPorID = async function (id, userNuevo) {
    //console.log(id);

    var user = await this.getUserByID(id);
    user.roles = userNuevo.roles;

    if (user.local.password != userNuevo.local.password) {//如果 密码 未改变， 则不 生成 新的 hash
        userNuevo.local.password = User.generateHash(userNuevo.local.password, user.local.salt);
    }

    user.local = userNuevo.local;
    user.displayName = userNuevo.displayName;
    await user.save();

    return user;
}

userSchema.methods.modificarInformacion = async function (userNuevo) {
    this.displayName = userNuevo.displayName;
    this.myArticulos = userNuevo.myArticulos;

    await this.save();

    return this;
}

userSchema.statics.eliminarPorID = async function (id) {
    var user = await this.findById(id);
    if (user == null) {
        return false;
    }

    // 删除 该 id user之后， 要删除 它的 所有的 articulos
    var writeResult = await User.deleteOne({ _id: id });
    if (writeResult.n > 0 && writeResult.ok == 1) {
        return true;
    } else {
        return false;
    }
};

userSchema.statics.createUser = async function (userNuevo) {
    console.log(userNuevo);
    var userCreado = await this.create(userNuevo);
    if (userCreado == null) {
        throw "创建失败";
    }

    return userCreado; // devuelve a promise with resolved value(userCreado)
}

userSchema.methods.getRoles = async function () {
    var rolesNames = this.roles;
    var name = null;
    var roles = [];
    var j = 0;
    for (var i = 0; i < rolesNames.length; i++) {
        name = rolesNames[i];
        var temporal = await Role.findOne({ "roleName": name });
        if (temporal != null) {
            roles[j] = temporal;
            j++;
        }
    }
    //console.log(roles);

    return roles;
}

userSchema.methods.getRolesNames = function () {
    return this.roles;
}







let Item = require('./../Item')

// About Items

// pulibcarMiItemNuevo
userSchema.methods.publicarMiItemNuevo = async function (req) {
    var instancia = Item.createNuevo(req);
    return instancia;
}

// eliminarMiItemPorID
userSchema.methods.eliminarMiItemPorID = async function (itemID) {
    var instanciaItem = await Item.obtenerPorID(itemID);
    if (instanciaItem == null) {
        return false;
    }

    // Check the item belongs to that user
    var userID = this._id;
    if (instanciaItem.usuario.toString() != userID.toString()) {
        return false;
    }

    var resultado = await Item.eliminarPorID(instanciaItem)

    return resultado;
}

// obtenerMiItemPorID
userSchema.methods.obtenerMiItemPorID = async function (itemID) {
    var instanciaItem = await Item.obtenerPorID(itemID);
    console.log(instanciaItem)
    if (instanciaItem == null) {
        return null;
    }

    // Check the item belongs to that user
    var userID = this._id;
    if (instanciaItem.usuario.toString() != userID.toString()) {
        return null;
    }

    return instanciaItem;
}

// setearMiItemComoVendido
userSchema.methods.setearMiItemComoVendido = async function (itemID) {
    var instanciaItem = await Item.obtenerPorID(itemID);
    if (instanciaItem == null) {
        return false;
    }

    // Check the item belongs to that user
    var userID = this._id;


    if (instanciaItem.usuario.toString() == userID.toString()) {
        var result = await instanciaItem.setearComoVendido();
        //console.log(result);
        if (result == true) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

async function getItems(arrayIDs) {
    var item;
    for (var i = 0; i < arrayIDs.length; i++) {
        item = arrayIDs[i];
        arrayIDs[i] = new mongoose.Types.ObjectId(item);
    }

    //console.log(arrayIDs);
    var docs = await Item.find({
        '_id': { $in: arrayIDs }
    });


    //console.log(docs);
    return docs;
}

// PaginarItemsGustadosPorUserID
userSchema.methods.itemsGustadosPorID = async function (page, limit) {
    var result = User.paginateFromArray(page, limit, this.itemsGustados);
    result.docs = await getItems(result.docs);

    // limpiar los items de ids inexistentes
    this.itemsGustados = result.docs.map(item => item._id);
    await this.save()

    return result;
}
// PaginarItemsVistosPorUserID
userSchema.methods.itemsVistosPorID = async function (page, limit) {
    var result = User.paginateFromArray(page, limit, this.itemsVistos);
    result.docs = await getItems(result.docs);

    // limpiar los items de ids inexistentes
    this.itemsVistos = result.docs.map(item => item._id);
    await this.save()


    return result;
}

// anadirUnItemComoGustado
userSchema.methods.anadirUnItemComoGustado = async function (itemID) {

    if (mongoose.Types.ObjectId.isValid(itemID)) {
        if (siExiste(this.itemsGustados, itemID) == true) {
            return true;
        }

        this.itemsVistos.unshift(itemID);

        var saved = this.save();
        if (saved != null) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

function siExiste(itemsIDsArray, itemID) {
    var id;
    var encontrado = false;
    for (var i = 0; i < itemsIDsArray.length && !encontrado; i++) {
        id = itemsIDsArray[i];
        if (itemID == id) {
            encontrado = true;
        }
    }
    return encontrado;
}

// anadirUnItemComoVisto
userSchema.methods.anadirUnItemComoVisto = async function (itemID) {

    if (mongoose.Types.ObjectId.isValid(itemID)) {
        if (siExiste(this.itemsVistos, itemID) == true) {
            return true;
        }

        this.itemsVistos.unshift(itemID);

        var saved = this.save();
        if (saved != null) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }



}


// eliminarUnItemGustado
userSchema.methods.eliminarUnItemGustado = async function (itemID) {
    if (mongoose.Types.ObjectId.isValid(itemID)) {
        this.itemsGustados.pull(itemID);
        var saved = this.save();

        if (saved != null) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

// eliminarUnItemVisto
userSchema.methods.eliminarUnItemVisto = async function (itemID) {
    if (mongoose.Types.ObjectId.isValid(itemID)) {
        this.itemsVistos.pull(itemID);
        var saved = this.save();

        if (saved != null) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }

}



userSchema.pre('save', function (next) {
    now = new Date();
    this.actualizada = now;
    if (!this.created) {
        this.creada = now;
    }
    next();
});

userSchema.pre('update', function () {
    this.update({}, { $set: { actualizada: new Date() } });
});

userSchema.plugin(mongoosePaginate);


var mongoosePaginateFromArray = require('../../pluginMongoose/paginateFromArray');
userSchema.plugin(mongoosePaginateFromArray);

var User = mongoose.model('User', userSchema);


module.exports = User;