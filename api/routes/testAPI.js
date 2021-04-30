var express = require("express");
var router = express.Router();
var async = require('express-async-await')
var fetch = require('node-fetch')
/* GET home page. */
router.get('/', function (req, res, next) {
    /* function ooIfoundData() {
         var myName = "dickydns"
         return fetch(`http://localhost:9000/preview/layer/1.conv2d.html${myName}`)
     }
     const ooIprocessData = async () => {
         const github = await oIfoundData()
         const ooiResponseData = await github.json()
         console.log(ooiResponseData)
     }
     ooIprocessData()
     res.end */

    res.sendFile(__dirname + '/2.dense.html');

});
module.exports = router