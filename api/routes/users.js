var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  //res.send('respond with a resource');

  res.send('/1.conv2d.html');
});

module.exports = router;
