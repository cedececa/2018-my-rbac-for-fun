var User = require("./User")
var Role = require("./Role")
var API = require("./API")

/*  Method 

    < Escanear todas las APIS usando ListEndpoints
    < Insertar las APIS (operaciones)
        << Comprobar si existe en la Schema API cada API antes de insercion

*/


// RBAC - how to get all paths
// Get all paths and methods
// https://stackoverflow.com/questions/14934452/how-to-get-all-registered-routes-in-express?rq=1
function RBAC(permisosExistentes) {
    this.permisos = permisosExistentes;
    /* 
        [{
            path: '/',
            methods: ['POST']
        },
        {
            path: '/about',
            methods: ['GET']
        }] 
    */
};

RBAC.prototype.insertarLasAPISExistentes = async function () {
    console.log("Insercion de APIs existentes en APP");
    let permisos = this.permisos;
    var element = null
    for (var i = 0; i < permisos.length; i++) {
        element = permisos[i];

        var si = await API.siExistePorMethodYPath(element.methods, element.path);
        //console.log("existe: " + si);
        if (si == false) {  // no existe    
            await API.crearUnaOperacion(element.methods, element.path);
        }
        process.stdout.write(".");
    };
    console.log("Terminado")
    console.log()

}

// 如果 存在 返回 真
RBAC.prototype.siExisteEnAPP = function (apiEnDB) {
    let permisos = this.permisos;
    var apiEnAPP = null
    var existe = false;
    for (var i = 0; i < permisos.length && existe == false; i++) {
        apiEnAPP = permisos[i];

        if (
            apiEnAPP.methods == apiEnDB.method &&
            apiEnAPP.path == apiEnDB.path
        ) {
            existe = true;
        }
    };

    return existe;
}

/*  Method 

    < Eliminar las APIS (operaciones) en Schema API que no existen en APP
*/
RBAC.prototype.eliminarLasAPISNoExistentes = async function () {
    console.log("Eliminacion de APIs existentes en APP")

    var apisEnDB = await API.find().exec();
    //console.log(apisEnDB);
    var apiDB = null;

    for (var i = 0; i < apisEnDB.length; i++) {
        apiDB = apisEnDB[i];
        if (this.siExisteEnAPP(apiDB) == false) {
            await API.eliminarUnaOperacionPormethodNombreAndPathNombre(apiDB.method, apiDB.path);
        }
        process.stdout.write(".");
    };
    console.log("Terminado")
    console.log()

}

var Role = require('./Role')
RBAC.prototype.actualizarLosAPIsDeRoles = async function () {
    console.log("Actualizacion de APIs de Roles A DB")

    try {
        var roles = await Role.find();

        var role = null;
        for (var i = 0; i < roles.length; i++) {
            role = roles[i];
            await role.actualizarLosAPIS();
            process.stdout.write(".");
        }

        console.log("Terminado")
        console.log()
    } catch (err) {
        //console.log(err);
    }
}

RBAC.prototype.initRolesPrimitivosYSusApis = async function () {

    // Crear root role
    var rootExist = await Role.existeRolePorNombre("root")
    if (rootExist == false) {
        Role.createRole({
            roleName: "root"
        })
            .then(rootRole => {
                console.log("role root: se ha creado correctamente");
            })
            .catch(err => {
                console.log("role root: no se ha creado");
            })
    }

    // Crear usuarioNormal
    var usuarioNormalExist = await Role.existeRolePorNombre("usuarioNormal");
    if (usuarioNormalExist == false) {
        
        await Role.createRole({
            roleName: "usuarioNormal"
        });
    }
    var usuarioNormal = await Role.getRoleByName("usuarioNormal");
    await usuarioNormal.addApiPermitidoPorMethodAndPath('GET', '/articulo/pagina/:number').catch(err => {
        //console.log(err);
    });
    await usuarioNormal.addApiPermitidoPorMethodAndPath('DELETE', '/articulo').catch(err => {
        //console.log(err);
    });
}

RBAC.prototype.initAPIs = async function (APISExistentes) {
    this.permisos = APISExistentes;
    //console.log(this.permisos);
    await this.insertarLasAPISExistentes();
    await this.eliminarLasAPISNoExistentes();
    await this.actualizarLosAPIsDeRoles();
    await this.initRolesPrimitivosYSusApis();
}

/*  Method 

    < Comprobar si cada usuario tiene permiso cuando hace una operacion / usa una API
        << Iterar todos los roles que tiene
        << Iterar todos los permisos que tiene cada role
*/
RBAC.prototype.comprobarSiTienePermiso = async function (email, method, pathPattern) {

    var user = await User.getUserByEmail(email)

    if (user == null) {
        console.log("怎么有问题呢");
    }

    var roles = await user.getRoles();
    var role = null;

    var tiene = false;

    for (var i = 0; i < roles.length && tiene == false; i++) {
        role = roles[i];
        if (role.roleName == "root") {
            tiene = true;
        } else {
            //console.log(role);
            var r = await role.siTengoEsteAPIParaComprobacionRegexp(method, pathPattern);
            //console.log(r);
            if (r == true) {    // si se encuentra
                tiene = true;
            }
        }
    }

    return tiene;
}

RBAC.prototype._matchPattern = function (pathPattern, path) {

    //console.log("soy pathPatron " + pathPattern);
    //console.log("soy path " +path);

    if (pathPattern.startsWith("/")) {
        pathPattern = pathPattern.substring(1);
    }

    if (pathPattern.endsWith("/")) {
        pathPattern = pathPattern.substring(0, pathPattern.length-1);
    }
    if (path.startsWith("/")) {
        path = path.substring(1);
    }
    if (path.endsWith("/")) {
        path = path.substring(0, path.length-1);
    }
    //console.log(pathPattern);
    //console.log(path);

    var splitsA = pathPattern.split("/");
    var splitsB = path.split("/");
    
    //console.log(splitsA);
    //console.log(splitsB); 

    var sA = null;

    for (var i = 0; i < splitsA.length; i++) {
        sA = splitsA[i];
        if (sA.startsWith(":")) {
            splitsA.splice(i, 1);    // 去掉 i 位置的 一个 item
            splitsB.splice(i, 1);
        }
    }

    if (splitsA.length != splitsB.length) {
        return false;
    } 
    //console.log(splitsA);
    //console.log(splitsB);

    for (var j = 0; j < splitsA.length; j++) {
        if (splitsA[j] != splitsB[j]) {
            return false;
        }
    }

    return true;
}

RBAC.prototype.getPathPatternMatched = function (method, originalUrl) {

    var apisEnAPP = this.permisos;
    var api = null;

    var encontrado = false;
    var patronEncontrado = null;

    for (var i = 0; i < apisEnAPP.length && encontrado == false; i++) {
        api = apisEnAPP[i];
        if (
            method == api.methods &&
            originalUrl == api.path
        ) {

            patronEncontrado = api.path;
            encontrado = true;
            console.log();
            console.log("url: " + originalUrl + "  method: " + method  + " matches this path: " + api.path + "  method: " + api.methods );
        }
    }    

    console.log(patronEncontrado);
    if(patronEncontrado!=null){
        return patronEncontrado;
    }

    for (var i = 0; i < apisEnAPP.length && encontrado == false; i++) {
        api = apisEnAPP[i];
        if (
            method == api.methods &&
            this._matchPattern(api.path, originalUrl)
        ) {

            patronEncontrado = api.path;
            encontrado = true;
            console.log();
            console.log("url: " + originalUrl + "  method: " + method  + " matches this path: " + api.path + "  method: " + api.methods );
        }
    }
    return patronEncontrado;
}

module.exports = RBAC;