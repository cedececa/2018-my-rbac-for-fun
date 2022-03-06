var express = require('express');
var router = express.Router();
var path = process.cwd() + '/uploaded/imagenes/';
var Item = require('./../models/Item')


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


router.get('/imagen/:imagenName', (req, res, next) => {
    console.log("hola");

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

// https://github.com/expressjs/body-parser
/*
    Express route-specific
    This example demonstrates adding body parsers specifically to the routes that need them. 
    In general, this is the most recommended way to use body-parser with Express.
*/

const bodyParser = require('body-parser');
var jsonParser = bodyParser.json({ limit: '3mb' });
var urlencodedParser = bodyParser.urlencoded({ limit: '3mb', extended: true });
var logStuff = [jsonParser, urlencodedParser]

router.post('/', logStuff, function (req, res) {

    if (req.body.nombre == null) {
        res.json({
            code: 1,
            msg: "请填写物品名称"
        })
        return;

    }
    if (req.body.precio == null || req.body.precio <= 0 || isNaN(req.body.precio) == true) {
        res.json({
            code: 1,
            msg: "请填写物品价格"
        })
        return;
    }

    if (req.body.descripcion == null) {
        res.json({
            code: 1,
            msg: "请描述物品"
        })
        return;
    }
    // 至少 上传 一张 图片
    if (req.body.imagenes == null || req.body.imagenes.length < 1) {
        res.json({
            code: 1,
            msg: "至少上传一张图片"
        })
        return;
    }

    if (req.body.catalogoName == null) {
        res.json({
            code: 1,
            msg: "类别不能为空"
        })
    }

    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    console.log(ip);

    Item.createNuevo(req)
        .then(creado => {
            if (creado != null) {
                res.json({
                    code: 0,
                    msg: "成功发布您的物品"
                });
                return;
            } else {
                res.json({
                    code: 1,
                    msg: "发布失败"
                });
                return;
            }
        })
        .catch(msg => {
            console.log(msg);
            catchHandler(res, msg, "发布失败，请稍后再试，如在不行， 请联系本公司");
            return;
        });
    return;
});

// modificar por ID solo para root
router.put('/', logStuff, function (req, res) {
    if (req.body.id == null) {
        res.json({
            code: 1,
            msg: "请填写物品id"
        })
        return;
    }
    if (req.body.nombre == null) {
        res.json({
            code: 1,
            msg: "请填写物品名称"
        })
        return;
    }
    if (req.body.precio == null && req.body.precio >= 0) {
        res.json({
            code: 1,
            msg: "请填写物品价格"
        })
        return;
    }

    if (req.body.descripcion == null) {
        res.json({
            code: 1,
            msg: "请描述物品"
        })
        return;
    }
    // 至少 上传 一张 图片
    if (req.body.imagenes == null || req.body.imagenes.length < 1) {
        res.json({
            code: 1,
            msg: "至少上传一张图片"
        })
        return;
    }

    if (req.body.catalogoName == null) {
        res.json({
            code: 1,
            msg: "类别不能为空"
        })
    }

    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    console.log(ip);

    Item.modificarPorID(req)
        .then(result => {
            if (result == true) {
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


var jsonParser1 = bodyParser.json();
var urlencodedParser1 = bodyParser.urlencoded({ extended: false })
var logStuff1 = [jsonParser1, urlencodedParser1]

// eliminar por ID solo para root
router.delete('/', logStuff1, function (req, res, next) {
    if (req.body.id == null || req.body.id == '') {
        return res.json({
            code: 1,
            msg: "操作错误"
        })
    }
    var id = req.body.id; // id

    Item.eliminarPorID(id)
        .then(result => {
            if (result) {
                res.json({
                    code: 0,
                    msg: "删除成功"
                })
            } else {
                throw "删除失败";
            }
        })
        .catch(msg => {
            catchHandler(res, msg, "删除失败");
        })
    return;
})

// get uno existente por ID
router.get('/:id', function (req, res, next) {
    if (req.params.id == null || req.params.id == '') {
        return res.json({
            code: 1,
            msg: 'id 不 为空'
        })
    }
    var id = req.params.id;

    var promise = Item.obtenerPorID(id);
    promise.then(item => {
        if (item) {
            //console.log(item);
            res.json({
                code: 0,
                data: item
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


// Paginar items
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
    Item.paginate({}, { sort: { fechaPublicada: 'desc' }, page: pageNumber, limit: cantidadASacar }, function (err, result) {
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

// Setear item como vendido
router.put('/setComoVendido', logStuff1, function (req, res, next) {
    if (req.body.id == null) {
        res.json({
            code: 1,
            msg: "物品id不能为空"
        })
        return;
    }

    Item.obtenerPorID(req.body.id)
        .then(async (item) => {
            var saved = await item.setearComoVendido();
            if (saved == null) {
                res.json({
                    code: 1,
                    msg: "物品不存在， 设置失败"
                })
            } else {
                res.json({
                    code: 1,
                    msg: "设置成功"
                })
            }
        }).catch(msg => {
            catchHandler(res, msg, "设置失败，请稍后再试，如在不行， 请联系本公司");
        });
})

// Setear item como gustado

// Setear item como visto

// Setear item como no enVenta




module.exports = router;
