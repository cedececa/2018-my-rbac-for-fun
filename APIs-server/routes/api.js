var express = require('express');
var router = express.Router();
var API = require("./../models/RBAC/API");

router.get('/all', (req, res, next) => {
    API.getAllAPIs()
        .then(apis => {
            //console.log(apis);
            res.json({
                code: 0,
                msg: "correcto",
                data: apis
            });
        }).catch(mensaje => {
            catchHandler(res, mensaje, "no apis");
        })
    return;
});


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
