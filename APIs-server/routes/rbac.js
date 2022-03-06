var express = require('express');
var router = express.Router();

router.get('/logueado', (req, res, next) => {
    if (
        req.session == null ||
        req.session.token == null ||
        req.cookies.token != req.session.token
    ) {
/*         console.log()
        console.log("no logueado") */
        return res.json({
            code: 10,
            msg: "请登录"
        });
    } else {
        return res.json({
            code: 0,
            msg: "logueado"
        })
    }
});




module.exports = router;
