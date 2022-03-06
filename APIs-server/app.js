
var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
app.use(cookieParser());


/* var cors = require('cors');

const whitelist = [
  'http://127.0.0.1:8080',
  'http://localhost:8080',
  'http://192.168.1.103:8080',
  'http://localhost:8081',
  'http://192.168.1.103:8081'
];

var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  exposedHeaders: ['Content-Length'],
  allowedHeaders: ['Accept','Authorization', 'Content-Type', 'X-Requested-With', 'Range']
};

app.use(cors(corsOptions))
 */

// https://stackoverflow.com/questions/30761154/how-to-enable-cors-on-express-js-4-x-on-all-files
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', req.get('Origin') || 'http://localhost:8080');
  res.header("Content-Type", "application/json");

  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Access-Control-Expose-Headers', 'Content-Length');
  //res.header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, X-Requested-With,X-HTTP-Method-Override, Range');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    return res.send(200);
  } else {
    return next();
  }
});


var path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');



var session = require('express-session');
app.use(session({
  secret: 'hola mi amor',
  resave: false,
  saveUninitialized: true,
  cookie: { expires: new Date(Date.now() + 1000 * 60 * 60 * 24) } //  equals one day or 24 hours
}))

var logger = require('morgan');
app.use(logger('dev'));

// 设置 数据库 的 连接 mongoose
var mongoose = require('mongoose')
async function runDB() {
  //mongoose.connect('mongodb://root:171260225@192.168.59.156:27017/demo')
  await mongoose.connect('mongodb://127.0.0.1:27017/lab1', {
    useNewUrlParser: true,
    useUnifiedTopology: true 
  });
  mongoose.connection.on("connected", function () {
    console.log("MongoDB connected success.")
  });
  mongoose.connection.on("error", function () {
    console.log("MongoDB connected fail.")
  });
  mongoose.connection.on("disconnected", function () {
    console.log("MongoDB disconnected .")
  });
}

/* 
  To avoid-304-not-modified
  Easiest solution:
  app.disable('etag');
  Alternate solution here if you want more control: 
*/
// https://vlasenko.org/2011/10/12/expressconnect-static-set-last-modified-to-now-to-avoid-304-not-modified/
app.disable('etag');


// 判断 是否 登陆
// Use RBAC 基于 角色 的 访问 控制
var RBAC = require('./models/RBAC/RBAC_Main');
let instanceRBAC = new RBAC();
var User = require('./models/RBAC/User')
app.use(async function (req, res, next) {

  // 任何人 都 可以 访问 的 apis
  if (
    req.originalUrl == "/" ||
    req.originalUrl == "/user/login/" ||
    req.originalUrl == "/user/login" ||
    req.originalUrl == "/user/logout" ||
    req.originalUrl == "/user/logout/" ||
    (req.originalUrl == "/user/" && req.method == "POST") ||
    (req.originalUrl == "/rbac/logueado" && req.method == "GET") ||
    (req.originalUrl == "/rbac/logueado/" && req.method == "GET")
  ) {
    return next();
  } else {

    // 判断 是否 登陆
    // ensure user is logged in

       console.log(req.session);
        console.log(req.cookies.token);
        console.log(req.session.email);
        console.log(req.session.userID);         
    if (
      req.session == null ||
      req.session.token == null ||
      req.cookies.token != req.session.token
    ) {
      console.log()
      console.log("no logueado")
      return res.json({
        code: 10,
        msg: "请登录"
      });
    }

    // 已经登陆， 给 current user 到 req 
    var currentUser = await User.findOne({ _id: req.session.userID });
    if (currentUser == null) {
      res.json({
        code: 10,
        msg: "请登录"
      });
      return;
    }
    req.userLogueado = currentUser;


    // 查询 是否 有 权利 执行
    var pathPatternEncontrado = instanceRBAC.getPathPatternMatched(req.method, req.originalUrl);      // get path pattern
    if (pathPatternEncontrado == null) {  // 不存在
      return res.json({
        code: 9,
        msg: "no hay este tipo de servicio"
      });
    }
    instanceRBAC.comprobarSiTienePermiso(req.session.email, req.method, pathPatternEncontrado)
      .then(resultado => {
        if (resultado == false) {
          console.log("no tiene permiso")
          throw "no tiene permiso";
        } else {
          console.log();
          console.log(req.method + " " + pathPatternEncontrado + " Permitido Ejecutar ");
          return next(); // tiene permiso de acceso a ejecutar el API.
        }
      })
      .catch(err => {
        catchHandler(res, err, "无许可");
      });

  }
});


const bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var logStuff = [jsonParser, urlencodedParser]


// Routers
var indexRouter = require('./routes/index');
app.use('/', indexRouter);


var userRouter = require('./routes/user');
app.use('/user', userRouter);

var articuloRouter = require('./routes/articulo');
app.use('/articulo', articuloRouter);  // 127.0.0.1/articulo/list

var rbacRouter = require('./routes/rbac');
app.use('/rbac', logStuff, rbacRouter);

var roleRouter = require('./routes/role');
app.use('/role', logStuff, roleRouter);

var apiRouter = require('./routes/api');
app.use('/api', logStuff, apiRouter);

var itemRouter = require('./routes/item');
app.use('/item', itemRouter);

var catalogoRouter = require('./routes/catalogo');
app.use('/catalogo', catalogoRouter);

var createError = require('http-errors');
// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', { error: err })
});


// Inicializacion de RBAC para todas las APIS
// 1. Otenemos todas las APIs de APP
const listEndpoints = require('./models/RBAC/ListEndpoints')
var APISExistentes = listEndpoints(app)
// 2. Actualizamos todas las APIs de APP a API de DB
//console.log(APISExistentes);
runDB()
  .then(() => {
    instanceRBAC.initAPIs(APISExistentes);

    // RBAC 设置
    /*
     Role 
        - hay dos tipos de Usuarios al principio
            1 - usuario normal
            2 - usuario root
     */
    var Role = require('./models/RBAC/Role');
    var User = require('./models/RBAC/User');
  })
  .catch(err => {
    console.log(err);
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

module.exports = app;
