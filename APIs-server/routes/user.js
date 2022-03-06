var express = require('express');
var router = express.Router();
var User = require('./../models/RBAC/User');
var GUID = require('./../pluginMongoose/GUID');
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

const bodyParser1 = require('body-parser');
var jsonParser1 = bodyParser1.json();
var urlencodedParser1 = bodyParser1.urlencoded({ extended: false })
var logStuff1 = [jsonParser1, urlencodedParser1]


/* 
  =============================================================================
  APIS de sistema de autenticacion ==================================================
  =============================================================================
*/

// loguear
router.post('/login', logStuff1,function (req, res, next) {
  if (req.body.email == null || req.body.email == '') {
    return res.json({
      code: 3,
      msg: "Email 不能为空"
    })
  }
  // 验证 是否 是 一个 合法的 邮件名称
  if (!validateEmail(req.body.email)) {
    return res.json({
      code: 3,
      msg: "Email 名称 不正确， 请输入 一个 正确的 Email"
    })
  }
  var email = req.body.email;

  if (req.body.password == null || req.body.password == '') {
    return res.json({
      code: 3,
      msg: "密码 不能为空"
    })
  }

  var password = req.body.password;

  User.getUserByEmail(email)
    .then(userEncontrado => {
      if (userEncontrado.validPW(password) == false) {  // 账号密码 验证
        throw " 请输入 正确的 账号 和 密码";
      }

      // 账号密码 正确， 生成 token, 存入 logueado schema， 存 email 和 token
      req.session.token = GUID.getInstance().nextGUID();
      req.session.email = email;
      req.session.userID = userEncontrado._id;


      // 设置 用户 的 browser 的 cookie 的 token 和 email
      var oneDayTimeInMiliseconds = 1000 * 60 * 60 * 24;
      var expiresDate = new Date(Date.now() + oneDayTimeInMiliseconds)
      console.log(expiresDate);
      res.cookie('token', req.session.token, { expires: expiresDate, httpOnly: true });
      res.cookie('email', email, { expires: expiresDate, httpOnly: true });

      res.json({
        code: 0,
        msg: '登陆成功'
      });
    })
    .catch(err => {
      catchHandler(res, err, "登陆失败， 请核对账号密码，再尝试");
    })
  return;
})
// logout
router.get('/logout', function (req, res, next) {
  req.session.token = null;
  req.session.email = null;
  req.session.userID = null;
  res.clearCookie('token');
  res.clearCookie('email');

  res.json({
    code: 0,
    msg: '成功登出'
  })

  return;
})

router.get('/basicInfo', function (req, res, next) {
  User.getUserByEmail(req.session.email)
    .then(userEncontrado => {
      res.json({
        code: 0,
        msg: "",
        data: userEncontrado.displayName || "无名"
      });
    })
    .catch(err => {
      catchHandler(res, err, "无信息");
    })

  return;
})

// recuperar password por email 
router.post('/recuperar', logStuff1,function (req, res, next) {

})

// modificar password


// https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());

}
// https://stackoverflow.com/questions/26322867/how-to-validate-password-using-following-conditions
function validatePassword(password) {
  return /[A-Z]/.test(password) &&   // 一个大写字母 
    /[a-z]/.test(password) &&   // 一个小写字母
    /[0-9]/.test(password) &&   // 一个数
    /[^A-Za-z0-9]/.test(password) &&   // 一个特殊符号
    password.length >= 8 &&   // 长度 大于 8
    password.length <= 32              // 小于 32
    ;
}

// crear uno nuevo
router.post('/', logStuff1,function (req, res, next) {
  if (req.body.email == null || req.body.email == '') {
    return res.json({
      code: 3,
      msg: 'Email 不能为空'
    })
  }
  // 验证 是否 是 一个 合法的 邮件名称
  if (!validateEmail(req.body.email)) {
    return res.json({
      code: 3,
      msg: "Email 名称 不正确， 请输入 一个 正确的 Email"
    })
  }
  if (req.body.password1 == null || req.body.password1 == '') {
    return res.json({
      code: 3,
      msg: '密码1 不能为空'
    })
  }
  if (req.body.password2 == null || req.body.password2 == '') {
    return res.json({
      code: 3,
      msg: '密码2 不能为空'
    })
  }
  if (req.body.password1 != req.body.password2) {
    return res.json({
      code: 3,
      msg: '两次密码不相同，请重新输入核对密码'
    })
  }
  if (!validatePassword(req.body.password1)) {
    return res.json({
      code: 3,
      msg: '密码 至少 包含 一个大写字母 一个小写字母 一个数 一个特殊符号， 长度 大于 8 小于 32'
    })
  }
  if (req.body.displayName == null || req.body.displayName == '') {
    return res.json({
      code: 3,
      msg: '昵称不能为空'
    })
  }

  var salt = User.generateSalt();
  //console.log(salt);
  var passwordCifrado = User.generateHash(req.body.password1, salt);
  var userNuevo = {
    local: {
      email: req.body.email,
      password: passwordCifrado,   // Store hash generated by password
      salt: salt
    },
    roles: req.body.roles || ["usuarioNormal"]
  }

  User.createUser(userNuevo)
    .then(userAnadido => {
      res.json({
        code: 0,
        msg: '创建成功, id 为:' + userAnadido._id
      });
    })
    .catch(err => {

      //console.log(mensaje);
      if (err.code) {
        if (err.code == 11000) {
          catchHandler(res, err, "该名字已经存在");
        } else {
          catchHandler(res, err, "db error");
        }
      }
      catchHandler(res, err, "创建失败， 账号或密码有错误，请按照要求填写");
    })

  return;
})

// get uno existente por ID
router.get('/:id', function (req, res, next) {
  if (req.params.id == null || req.params.id == '') {
    return res.json({
      code: 3,
      msg: 'id 不 为空'
    })
  }
  var id = req.params.id;

  var promise = User.getUserByID(id);
  promise.then(user => {
    res.json({
      code: 0,
      msg: "correcto",
      data: user
    });
  }).catch(mensaje => {
    catchHandler(res, mensaje, "no existe");
  })
  return;
})

// modificar uno existente por ID - solo para el administrador
router.put('/',logStuff1, function (req, res, next) {
  var user = req.body.userNuevo; // user

  if (user == null || user._id == '' || user._id === undefined) {
    return res.json({
      code: 1,
      msg: '操作有误'
    })
  }
  if (user.displayName == null || user.displayName == '') {
    return res.json({
      code: 1,
      msg: '姓名 不能为空'
    })
  }
  var promise = User.modificarUserPorID(user._id, user);
  promise.then(userModificado => {

    res.json({
      code: 0,
      msg: "modificado",
      data: userModificado
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

// eliminar uno existente por ID
router.delete('/', function (req, res, next) {
  if (req.body.id == null || req.body.id == '') {
    return res.json({
      code: 1,
      msg: "操作错误"
    })
  }
  var id = req.body.id; // id

  User.eliminarPorID(id)
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

// obtener sus roles por ID solo para root
router.get('/:id/roles', function (req, res, next) {
  if (req.params.id == null || req.params.id == '') {
    return res.json({
      code: 1,
      msg: 'id 不 为空'
    })
  }

  var id = req.params.id;
  var promise = User.getUserByID(id);
  promise.then(async user => {
    var roles = await user.getRoles();
    res.json({
      code: 0,
      msg: "correcto",
      data: roles
    });
  }).catch(mensaje => {
    catchHandler(res, mensaje, "no tiene roles");
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
  User.paginate({}, { sort: { creada: 'desc' }, page: pageNumber, limit: cantidadASacar }, function (err, result) {
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


// PaginarItemsPublicadosParaVenderPorUserID
// PaginarItemsVendidosPorUserID
// PaginarItemsGustadosPorUserID
// PaginarItemsVistosPorUserID
// PaginarItemsPublicadosParaVenderRapidoPorUserID


/* 
1   publicarMiItemNuevo
1   eliminarMiItemPorID
1   obtenerMiItemPorID
1   setearMiItemComoVendido
 */

// publicarMiItemNuevo

const bodyParser = require('body-parser');
var jsonParser = bodyParser.json({ limit: '3mb' });
var urlencodedParser = bodyParser.urlencoded({ limit: '3mb', extended: true });
var logStuff = [jsonParser, urlencodedParser]
router.post('/publicarMiItemNuevo',logStuff, async function (req, res, next) {

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
      msg: "请正确填写物品价格"
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
  if (req.body.imagenes.length < 1) {
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

  req.userLogueado.publicarMiItemNuevo(req)
    .then(instancia => {
      if (instancia != null) {
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

})

// eliminarMiItemPorID
router.delete('/eliminarMiItemPorID', logStuff1,function (req, res, next) {


  if (req.body.id == null || req.body.id == '') {
    return res.json({
      code: 1,
      msg: "操作错误"
    })
  }
  var itemID = req.body.id; // id

  req.userLogueado.eliminarMiItemPorID(itemID)
    .then(result => {
      if (result) {
        res.json({
          code: 0,
          msg: "删除成功"
        })
      } else {
        throw "删除失败1";
      }
    })
    .catch(msg => {
      console.log(msg)
      catchHandler(res, msg, "删除失败");
    })
  return;
})

// obtenerMiItem
router.get('/obtenerMiItem/:id', function (req, res, next) {
  if (req.params.id == null || req.params.id == '') {
    return res.json({
      code: 1,
      msg: "操作错误"
    })
  }
  var itemID = req.params.id; // id

  req.userLogueado.obtenerMiItemPorID(itemID)
    .then(instancia => {
      if (instancia) {
        res.json({
          code: 0,
          msg: "",
          data: instancia
        })
      } else {
        res.json({
          code: 1,
          msg: "不存在",

        })
      }
    })
    .catch(msg => {
      catchHandler(res, msg, "不存在");
    })
  return;
})

// setearMiItemComoVendido
router.put('/setearMiItemComoVendido',logStuff1, function (req, res, next) {
  if (req.body.id == null || req.body.id == '') {
    return res.json({
      code: 1,
      msg: "操作错误"
    })
  }
  var itemID = req.body.id; // id

  req.userLogueado.setearMiItemComoVendido(itemID)
    .then(result => {
      if (result == true) {
        res.json({
          code: 0,
          msg: "设置成功"
        })
      } else {
        res.json({
          code: 1,
          msg: "设置失败1"
        })
      }
    })
    .catch(msg => {
      catchHandler(res, msg, "设置失败");
    })
  return;
})

// PaginarItemsPublicadosParaVenderPorUserID
router.get('/itemsPublicadosParaVender/:pageNumber/', function (req, res, next) {

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
      "usuario": { $eq: req.userLogueado._id },
      "vendido": { $eq: false }
    }
    , { sort: { fechaPublicada: 'desc' }, page: pageNumber, limit: cantidadASacar }, function (err, result) {
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

// PaginarItemsVendidosPorUserID
router.get('/itemsVendidos/:pageNumber/', function (req, res, next) {

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
  Item.paginate({
    "usuario": req.userLogueado._id,
    "vendido": true
  }
    , { sort: { fechaVendida: 'desc' }, page: pageNumber, limit: cantidadASacar }, function (err, result) {
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

            nextPage: result.nextPage,
            prevPage: result.prevPage,

            page: result.page,

            limit: result.limit,
            totalDocs: result.totalDocs,
            totalPages: result.totalPages
          }
        });
    });
})

// PaginarItemsGustadosPorUserID
router.get('/itemsGustados/:pageNumber/', function (req, res, next) {

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

  req.userLogueado.itemsGustadosPorID(pageNumber, cantidadASacar)
    .then(result => {
      res.json(result);
    })
})

// PaginarItemsVistosPorUserID
router.get('/itemsVistos/:pageNumber/', function (req, res, next) {

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

  req.userLogueado.itemsVistosPorID(pageNumber, cantidadASacar)
    .then(result => {
      res.json(result);
    })
})

// anadirUnItemComoGustado
router.put('/anadirUnItemComoGustado',logStuff1, function (req, res, next) {

  if (req.body.itemID == null || req.body.itemID == "") {
    res.json({
      code: 1,
      msg: "操作有误"
    })
    return;
  }

  req.userLogueado.anadirUnItemComoGustado(req.body.itemID)
    .then(result => {
      if (result == true) {
        res.json({
          code: 0,
          msg: "操作成功"
        })
        return;
      } else {
        res.json({
          code: 1,
          msg: "操作失败"
        })
        return;
      }
    })

})

// anadirUnItemComoVisto
router.put('/anadirUnItemComoVisto',logStuff1, function (req, res, next) {

  if (req.body.itemID == null || req.body.itemID == "") {
    res.json({
      code: 1,
      msg: "操作有误"
    })
    return;
  }

  req.userLogueado.anadirUnItemComoVisto(req.body.itemID)
    .then(result => {
      if (result == true) {
        res.json({
          code: 0,
          msg: "操作成功"
        })
        return;
      } else {
        res.json({
          code: 1,
          msg: "操作失败"
        })
        return;
      }
    })
  return;
})

// eliminarUnItemGustado
router.put('/eliminarUnItemGustado',logStuff1, function (req, res, next) {

  if (req.body.itemID == null || req.body.itemID == "") {
    res.json({
      code: 1,
      msg: "操作有误"
    })
    return;
  }

  req.userLogueado.eliminarUnItemGustado(req.body.itemID)
    .then(result => {
      if (result == true) {
        res.json({
          code: 0,
          msg: "操作成功"
        })
        return;
      } else {
        res.json({
          code: 1,
          msg: "操作失败"
        })
        return;
      }
    })
})

// eliminarUnItemVisto
router.put('/eliminarUnItemVisto',logStuff1, function (req, res, next) {

  if (req.body.itemID == null || req.body.itemID == "") {
    res.json({
      code: 1,
      msg: "操作有误"
    })
    return;
  }

  req.userLogueado.eliminarUnItemVisto(req.body.itemID)
    .then(result => {
      if (result == true) {
        res.json({
          code: 0,
          msg: "操作成功"
        })
        return;
      } else {
        res.json({
          code: 1,
          msg: "操作失败"
        })
        return;
      }
    })
})

module.exports = router;
