var express = require('express');
var router = express.Router();


router.get('/', function(req, res){
    res.cookie('name', 'express').send('cookie set'); //Sets name = express
});

module.exports = router;
