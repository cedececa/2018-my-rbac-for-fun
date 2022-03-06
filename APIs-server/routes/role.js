var express = require('express');
var router = express.Router();
var Role = require("./../models/RBAC/Role");

router.get('/all', (req, res, next) => {
    Role.getAllRoles()
        .then(roles => {
            res.json({
                code: 0,
                msg: "correcto",
                data: roles
            });
        }).catch(mensaje => {
            catchHandler(res, mensaje, "no roles");
        })
    return;
});

// crear uno nuevo
router.post('/', function (req, res, next) {
    if (req.body.roleName == null || req.body.roleName == '') {
        return res.json({
            code: 3,
            msg: 'Role 名字 不能为空'
        })
    }

    var roleNuevo = {
        roleName: req.body.roleName,
        APIsPermitidos: req.body.APIsPermitidos || []
    }

    Role.createRole(roleNuevo)
        .then(roleNuevo => {
            res.json({
                code: 0,
                msg: 'Role ' + req.body.roleName + ' 创建成功, id 为:' + roleNuevo._id
            });
        })
        .catch(err => {
            console.log(err);
            catchHandler(res, err, 'Role ' + req.body.roleName + ' 创建失败, 请换个名字');
        })

    return;
})
// get uno existente por ID
router.get('/:roleName', function (req, res, next) {
    if (req.params.roleName == null || req.params.roleName == '') {
        return res.json({
            code: 3,
            msg: 'id 不 为空'
        })
    }
    var roleName = req.params.roleName;

    var promise = Role.getRoleByName(roleName);
    promise.then(role => {
        res.json({
            code: 0,
            msg: "correcto",
            data: role
        });
    }).catch(mensaje => {
        catchHandler(res, mensaje, "no existe");
    })
    return;
})
// eliminar uno existente por ID
router.delete('/', function (req, res, next) {
    if (req.body.id == null || req.body.id == '') {
        return res.json({
            code: 1,
            msg: "操作错误"
        })
    }

    var id = req.body.id; // id

    Role.eliminarPorID(id)
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

// modificar uno existente por ID - solo para el administrador
router.put('/', function (req, res, next) {
    var role = req.body.roleModificado; // role

    if (role == null || role._id == '' || role._id === undefined) {
        return res.json({
            code: 1,
            msg: '操作有误'
        })
    }
    if (role.roleName == null || role.roleName == '') {
        return res.json({
            code: 1,
            msg: '姓名 不能为空'
        })
    }
    var promise = Role.modificarRolePorID(role._id, role);
    promise.then(roleModi => {

        res.json({
            code: 0,
            msg: "modificado",
            data: roleModi
        });
    }).catch(mensaje => {
        //console.log(mensaje);
        if (mensaje.code) {
            if (mensaje.code == 11000) {
                catchHandler(res, mensaje, "该名字已经存在");
            } else {
                catchHandler(res, mensaje, "db error");
            }
        }
        catchHandler(res, mensaje, "no modificado");
    })
    return;
})
// Obtener users por pagina
router.get('/page/:number', function (req, res, next) {
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/isNaN
    if (isNaN(req.params.number)) {
        return res.json({
            status: 1,
            msg: '没有该页面',
            result: ''
        });
    }
    var pageNumber = Math.max(1, req.params.number);
    //var cantidad = Math.max(1, req.params.cantidad);
    var cantidadASacar = 10;

    // 日期 最大的 被放置 在 数组 的 0 位置 上
    Role.paginate({}, { sort: { creada: 'desc' }, page: pageNumber, limit: cantidadASacar }, function (err, result) {
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
