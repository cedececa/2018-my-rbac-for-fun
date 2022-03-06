var express = require('express');
var router = express.Router();
var Articulo = require('../models/Articulo');

function isEmpty(obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key))
      return false;
  }
  return true;
}
function esValido(obj) {
  if (obj != null && obj.length > 0) {
    return true;
  } else {
    return false;
  }
}

// OK . Crear Articulo
router.post('/', (req, res, next) => {
  if(req.body.articulo==null ){
    return res.json({
      code: 2,
      msg: '操作有错误'
    })
  }
  if(req.body.articulo.nombre==null || req.body.articulo.nombre ==''){
    return res.json({
      code: 3,
      msg: '名称不能是空的'
    })
  }

  var articuloNuevo = req.body.articulo;
  Articulo.create(articuloNuevo, (err, objetoAnadido) => {
    if (err != null) {
      if (err.code == 11000) { // nombre duplicado
        return res.json({
          code: 1,
          msg: '创建失败, 名称已经存在，请换一个名称'
        })
      } else {
        return res.json({
          err: err,
          msg: "创建失败"
        });
      }
    } else {
      return res.json({
        code: 0,
        msg: '创建成功, id 为:' + objetoAnadido._id,
      })
    }
  });
});

// OK . Actualizar(Modificar) articulo por su ID
router.put("/", (req, res, next) => {
  var articuloRecibido = req.body.articulo; // id
  if (articuloRecibido == null || articuloRecibido._id === undefined) {
    res.json({
      code: 2,
      msg: '不存在'
    })
  }
  Articulo.findOneAndUpdate({ '_id': articuloRecibido._id },
    {
      nombre: articuloRecibido.nombre,
      LDs: articuloRecibido.LDs,          // actualizar los LDs
      actualizada: new Date()
    },
    (err, articuloAntiguo) => {
      if (err != null) {
        res.json(
          {
            err: err,
            code: 1,
            msg: '修改失败:' + err
          }
        );
      } else {
        res.json(
          {
            err: err,
            code: 0,
            msg: '修改成功'
          }
        );
      }

    });
});

// . Eliminar un label-descripcion de un articulo por PID y su ID
router.delete('/ld', (req, res, next) => {
  if (req.body.pid == null || req.body.id == null) {
    res.json({
      code: 2,
      msg: '操作错误'
    })
  }
  var _pid = req.body.pid; // parent id
  var _id = req.body.id; // id

  Articulo.findById(_pid, (err, articulo) => {
    if(articulo==null){
      res.json({
        code: 3,
        msg: 'Articulo 不存在'
      })
    }
    if(articulo.LDs==null){
      res.json({
        code: 4,
        msg: 'Label 不存在'
      })
    }

    var ld = articulo.LDs.id(_id);
    articulo.LDs.pull(ld);           // 丢弃
    articulo.save(function (err) {
      if (err != null) {
        res.json(
          {
            err: err,
            code: 1,
            msg: '删除失败:' + err
          }
        );
      } else {
        res.json(
          {
            err: err,
            code: 0,
            msg: '删除成功'
          }
        );
      }
    });
  });
});

//. Eliminar un articulo y los labels-descri.. por ID
router.delete('/', (req, res, next) => {

  if (req.body.id == null) {
    res.json({
      code: 2,
      msg: '操作错误'
    });
    return;
  }
  var id = req.body.id;

  Articulo.deleteOne({_id:id}, (err, writeOpResult) => {
    if (err != null) {
      return res.json(
        {
          err: err,
          code: 1,
          msg: '删除失败'
        }
      );
    } else {
      if(writeOpResult.n>0 && writeOpResult.ok==1){
        return res.json(
          {
            err: err,
            code: 0,
            writeOpResult: writeOpResult,
            msg: '删除成功'
          }
        );  
      }else{
        return res.json(
          {
            err: err,
            code: 3,
            writeOpResult: writeOpResult,
            msg: '没有删除任何东西'
          }
        );  
      }
    }
  });
});

//. Obtener un articulo y sus labels-descrip por ID
router.get('/:id/', (req, res, next) => {
  var _id = req.params.id; // parent id
  Articulo.findById(_id, (err, articulo) => {
    if(err!= null){
      return res.json({
        code: 2,
        msg: 'Err' + err
      })
    }

    if(articulo==null){
      return res.json({
        code: 1,
        msg: 'Articulo 不存在'
      })
    }else{
      res.json({
        code: 0,
        msg: '成功获取',
        doc: articulo
      })
    }
  });
});

//. Obtener una lista de articulos por numero de pagina
router.get('/page/:number', (req, res, next) => {
  //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/isNaN
  if (isNaN(req.params.number)) {
    res.json({
      status: 1,
      msg: '没有该页面',
      result: ''
    });
    return;
  }
  var pageNumber = Math.max(1, req.params.number);
  //var cantidad = Math.max(1, req.params.cantidad);
  var cantidadASacar = 10;

  var articulos = Articulo.find({});
  // 降序， 从 大 到 小 开始，也就是说，数组 的 0 位置，放置 _id 最大的 对象  
  articulos
    .sort({ _id: -1 })
    .skip((pageNumber - 1) * cantidadASacar)
    .limit(cantidadASacar)
    .exec((err, filtrados) => {
      res.json({
        status: 0,
        msg: '成功',
        result: {
          filtrados: filtrados
        }
      });
    });

});

//. Obtener una lista de articulos por numero de pagina
router.get('/pagina/:number', (req, res, next) => {

  //console.log(req.route.path);

  //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/isNaN
  if (isNaN(req.params.number)) {
    res.json({
      status: 1,
      msg: '没有该页面',
      result: ''
    });
    return;
  }
  var pageNumber = Math.max(1, req.params.number);
  //var cantidad = Math.max(1, req.params.cantidad);
  var cantidadASacar = 10;

  // 日期 最大的 被放置 在 数组 的 0 位置 上
  Articulo.paginate({}, { sort:{creada:'desc'}, page: pageNumber, limit: cantidadASacar }, function (err, result) {
    // result.docs
    // result.total
    // result.limit - 10
    // result.page - 1
    // result.pages
    res.json(result);
  });

});

module.exports = router;
