var express = require('express');
var router = express.Router();
var fs = require("fs");
var path = process.cwd() + '/uploaded/imagenes/';
var Catalogo = require('./../models/Catalogo')
var Item = require('./../models/Item')

async function base64ToImage(base64Data) {
    var procesado = null
    procesado = base64Data.replace(/^data:image\/png;base64,/, "")
    //console.log(procesado);
    var rootPath = process.cwd() + '/uploaded/imagenes/';
    var fileName = (new Date().getTime()).toString(36);
    await fs.writeFile(rootPath + fileName + ".jpg", procesado, 'base64');

    return fileName;
}



const bodyParser = require('body-parser');
var jsonParser = bodyParser.json({ limit: '500kb' });
var urlencodedParser = bodyParser.urlencoded({ limit: '500kb', extended: true })

var logStuff = [jsonParser, urlencodedParser]
// Obtener una imagen de un catalogo por imagen Name
router.get('/imagen/:imagenName', (req, res, next) => {

    var options = {
        root: path,
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };
    console.log(options.root);
    var fileName = req.params.imagenName;
    fileName = fileName + ".jpg";
    res.sendFile(fileName, options, function (err) {
        if (err) {
            next(err);
        } else {
            console.log('OK Sent:', fileName);
        }
    });
});


// Crear un nuevo
router.post('/', logStuff, async function (req, res) {

    if (req.body.nombre == null && req.body.nombre == "") {
        res.json({
            code: 1,
            msg: "请填写分类名称"
        })
        return;

    }

    // 至少 上传 一张 图片
    if (req.body.imagen == null) {
        res.json({
            code: 1,
            msg: "请上传一张图片"
        })
        return;
    }

    const imagen = req.body.imagen;
    var imagenName = null;
    try {
        imagenName = await base64ToImage(imagen);
    }
    catch (err) {
        // console.log(err);
        res.json({
            code: 1,
            msg: "服务器存储照片出现问题, 请稍后再试"
        })
        return;
    }

    Catalogo.createNuevo({
        "nombre": req.body.nombre,
        "descripcion": req.body.descripcion,
        "imagenName": imagenName
    })
        .then(creado => {
            if (creado != null) {
                res.json({
                    code: 0,
                    msg: "成功创建新的类别, 类别是 " + req.body.nombre
                });
                return;
            } else {
                res.json({
                    code: 1,
                    msg: "创建类别失败" + req.body.nombre
                });
                return;
            }
        })
        .catch(msg => {
            if (msg.code == 11000) {
                catchHandler(res, msg, req.body.nombre + " 类别 已经存在");
                return;
            }
            catchHandler(res, msg, "创建类别失败，请稍后再试，如在不行， 请联系本公司");
        });
    return;
});



var jsonParser1 = bodyParser.json();
var urlencodedParser1 = bodyParser.urlencoded({ extended: false })
var logStuff1 = [jsonParser1, urlencodedParser1]


// Eliminar por ID solo para root
router.delete('/', logStuff1, function (req, res, next) {
    if (req.body.id == null || req.body.id == '') {
        return res.json({
            code: 1,
            msg: "操作错误"
        })
    }
    var id = req.body.id; // id

    Catalogo.eliminarPorID(id)
        .then(result => {
            if (result == true) {
                res.json({
                    code: 0,
                    msg: "删除成功"
                })
            } else {
                throw "删除失败";
            }
        })
        .catch(msg => {
            console.log(msg)
            catchHandler(res, msg, "删除失败 2");
        })
    return;
})
// Eliminar por nombre solo para root
router.delete('/nombre', logStuff1, function (req, res, next) {
    if (req.body.nombre == null || req.body.nombre == '') {
        return res.json({
            code: 1,
            msg: "操作错误"
        })
    }
    var nombre = req.body.nombre; // id

    Catalogo.eliminarPorNombre(nombre)
        .then(result => {
            if (result == true) {
                res.json({
                    code: 0,
                    msg: "删除成功"
                })
            } else {
                throw "删除失败";
            }
        })
        .catch(msg => {
            console.log(msg);
            catchHandler(res, msg, "删除失败 2");
        })
    return;
})

// Modificar Por ID
router.put('/', logStuff, async function (req, res) {
    if (req.body.id == null) {
        res.json({
            code: 1,
            msg: "请填写分类id"
        })
        return;
    }
    if (req.body.nombre == null && req.body.nombre == "") {
        res.json({
            code: 1,
            msg: "请填写分类名称"
        })
        return;

    }

    // 上传 一张 图片
    if (req.body.imagen == null) {
        res.json({
            code: 1,
            msg: "请上传一张图片"
        })
        return;
    }

    const imagen = req.body.imagen;
    var imagenName;
    try {
        imagenName = await base64ToImage(imagen);
    }
    catch (err) {
        // console.log(err);
        res.json({
            code: 1,
            msg: "服务器存储照片出现问题, 请稍后再试"
        })
        return;
    }
    var id = req.body.id;
    var catalogo = await Catalogo.obtenerPorID(id)
    if (catalogo == null) {
        res.json({
            code: 1,
            msg: "不存在该类别"
        })
        return;
    }
    // 改变 该分类 的 所有的 items 的 名字
    var itemsDeEsteCatalogo = await Item.find({ "catalogoName": catalogo.nombre });
    for (var item of itemsDeEsteCatalogo) {
        item.catalogoName = req.body.nombre;
        await item.save();
    }

    catalogo.modificar({
        "nombre": req.body.nombre,
        "descripcion": req.body.descripcion,
        "imagenName": imagenName
    })
        .then(result => {
            if (result == 0) {
                res.json({
                    code: 0,
                    msg: "修改成功"
                });
                return;
            } else {
                res.json({
                    code: 1,
                    msg: "修改未能成功"
                });
                return;
            }
        })
        .catch(msg => {
            console.log(msg);
            catchHandler(res, msg, "修改未能成功，请稍后再试，如在不行， 请联系本公司");
        });
    return;
});

// Modificar Por Nombre
router.put('/nombre', logStuff, async function (req, res) {

    if (req.body.nombre == null && req.body.nombre == "") {
        res.json({
            code: 1,
            msg: "请填写分类名称"
        })
        return;

    }
    var nombre = req.body.nombre;
    if ((await Catalogo.siExiste(nombre)) == false) {
        res.json({
            code: 1,
            msg: "不存在该类别"
        })
    }

    // 上传 一张 图片
    if (req.body.imagen == null) {
        res.json({
            code: 1,
            msg: "请上传一张图片"
        })
        return;
    }

    const imagen = req.body.imagen;
    var imagenName;
    try {
        imagenName = await base64ToImage(imagen);
    }
    catch (err) {
        // console.log(err);
        res.json({
            code: 1,
            msg: "服务器存储照片出现问题, 请稍后再试"
        })
        return;
    }

    var catalogo = await Catalogo.obtenerPorNombre(nombre)

    catalogo.modificar({
        "nombre": req.body.nombre,
        "descripcion": req.body.descripcion,
        "imagenName": imagenName
    })
        .then(result => {
            if (result == 0) {
                res.json({
                    code: 0,
                    msg: "修改成功"
                });
                return;
            } else {
                res.json({
                    code: 1,
                    msg: "修改未能成功"
                });
                return;
            }
        })
        .catch(msg => {
            console.log(msg);
            catchHandler(res, msg, "修改未能成功，请稍后再试，如在不行， 请联系本公司");
        });
    return;
});
// Obtener todos existente
router.get('/all', async function (req, res, next) {

    var allCatalogos = await Catalogo.find();
    //console.log(allCatalogos);
    res.json({
        code: 0,
        msg: "",
        data: allCatalogos
    });

    return;
})

// Obtener uno existente por ID
router.get('/:id', function (req, res, next) {
    if (req.params.id == null || req.params.id == '') {
        return res.json({
            code: 1,
            msg: 'id是空的'
        })
    }
    var id = req.params.id;

    var promise = Catalogo.obtenerPorID(id);
    promise.then(instancia => {
        if (instancia != null) {
            res.json({
                code: 0,
                msg: "",
                data: instancia
            });
        } else {
            res.json({
                code: 1,
                msg: "不存在"
            });
        }
    }).catch(mensaje => {
        catchHandler(res, mensaje, "不存在");
    })
    return;
})
// Obtener uno existente por ID
router.get('/nombre/:nombre', function (req, res, next) {
    if (req.params.nombre == null || req.params.nombre == '') {
        return res.json({
            code: 1,
            msg: '类别名称是空的'
        })
    }
    var nombre = req.params.nombre;

    var promise = Catalogo.obtenerPorNombre(nombre);
    promise.then(instancia => {
        if (instancia != null) {
            res.json({
                code: 0,
                msg: "",
                data: instancia
            });
        } else {
            res.json({
                code: 1,
                msg: "不存在"
            });
        }
    }).catch(mensaje => {
        catchHandler(res, mensaje, "不存在");
    })
    return;
})



// Paginar catalogos
router.get('/page/:pageNumber/', function (req, res, next) {
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/isNaN
    if (isNaN(req.params.pageNumber)) {
        return res.json({
            status: 1,
            msg: '没有该页面',
            result: ''
        });
    }
    var pageNumber = Math.max(1, req.params.pageNumber);
    //var cantidad = Math.max(1, req.params.cantidad);
    var cantidadASacar = 10;

    // 日期 最大的 被放置 在 数组 的 0 位置 上
    Catalogo.paginate({}, { sort: { creada: 'desc' }, page: pageNumber, limit: cantidadASacar }, function (err, result) {
        // result.docs
        // result.total
        // result.limit - 10
        // result.page - 1
        // result.pages
        res.json(
            {
                code: 0,
                data: {
                    docs: result.docs,
                    hasNextPage: result.hasNextPage,
                    hasPrevPage: result.hasPrevPage,
                    limit: result.limit,
                    nextPage: result.nextPage,
                    page: result.page,
                    prevPage: result.prevPage,
                    totalDocs: result.totalDocs,
                    totalPages: result.totalPages
                }
            });
    });
})

// Paginar items por nombre de un catalogo y page number
router.get('/:catalogoName/page/:pageNumber/', function (req, res, next) {

    if (req.params.catalogoName == null || req.params.catalogoName == "") {
        return res.json({
            status: 1,
            msg: '分类不能为空',
            result: ''
        });
    }

    // check if catalogo exists
    Catalogo.obtenerPorID()

    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/isNaN
    if (isNaN(req.params.pageNumber)) {
        return res.json({
            status: 1,
            msg: '没有该页面',
            result: ''
        });
    }
    var pageNumber = Math.max(1, req.params.pageNumber);
    //var cantidad = Math.max(1, req.params.cantidad);
    var cantidadASacar = 10;

    // 日期 最大的 被放置 在 数组 的 0 位置 上
    Item.paginate(
        {
            "catalogoName": req.params.catalogoName
        }
        ,
        {
            sort: { fechaPublicada: "desc" },
            page: pageNumber,
            limit: cantidadASacar
        },
        function (err, result) {
            res.json({
                code: 0,
                data: {
                    docs: result.docs,
                    hasNextPage: result.hasNextPage,
                    hasPrevPage: result.hasPrevPage,
                    limit: result.limit,
                    nextPage: result.nextPage,
                    page: result.page,
                    prevPage: result.prevPage,
                    totalDocs: result.totalDocs,
                    totalPages: result.totalPages
                }
            });
        });
})
function catchHandler(res, mensaje1, mensaje2) {
    if (typeof mensaje1 === 'string' || mensaje1 instanceof String) { // 判断 是否 是我们 手写的 错误， 是 则报错
        res.json({              // 手写 函数 报错， 比如 user 为空， 不 存在
            code: 1,
            msg: mensaje1
        });
    } else {
        //console.log("Error: ");   // 其它 中间件 的 报错, 为了 不 显示 给 frontend 用户， 我们 手写 -  必须 写
        //console.log(mensaje1);

        res.json({
            code: 1,
            msg: mensaje2             // 为了 不 显示 给 frontend 用户， 我们 手写 -  必须 写
        });
    }
}
module.exports = router;
