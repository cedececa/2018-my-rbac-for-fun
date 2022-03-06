var express = require('express');
var router = express.Router();


const multer = require("multer");

const handleError = (err, res) => {
    res
        .status(500)
        .contentType("text/plain")
        .end("哇，服务器出错了！");
};

const upload = multer({
    dest: "./../uploaded/images"
    // you might also want to set some limits: https://github.com/expressjs/multer#limits
});


router.post(
    "/upload",
    upload.single("file" /* name attribute of <file> element in your form */),
    (req, res) => {
        console.log(req.file);
        const tempPath = req.file.path;
        const targetPath = path.join(__dirname, "./uploads/image.png");

        var extension = path.extname(req.file.originalname).toLowerCase();

        if (extension === ".png" || extension === ".jpg" || extension === ".jpeg") {
            fs.rename(tempPath, targetPath, err => {
                if (err) return handleError(err, res);

                res
                    .status(200)
                    .contentType("text/plain")
                    .end("成功!");
            });
        } else {
            fs.unlink(tempPath, err => {
                if (err) return handleError(err, res);

                res
                    .status(403)
                    .contentType("text/plain")
                    .end("上传的图片的格式不允许，只允许 png， jpg， jpeg的格式!");
            });
        }
    }
);

router.get(
    "/:imageId",
    (req, res) => {
        // http://expressjs.com/en/api.html#res.sendFile
        var options = {
            root: __dirname + '/uploaded/images"',
            dotfiles: 'deny',
            headers: {
                'x-timestamp': Date.now(),
                'x-sent': true
            }
        };

        var fileName = req.params.imageId;
        res.sendFile(fileName, options, function (err) {
            if (err) {
                next(err);
            } else {
                console.log('Sent:', fileName);
            }
        });
    }
);

module.exports = router;
