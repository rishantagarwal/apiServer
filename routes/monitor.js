var express = require('express');
var router = express.Router();
var request = require('request');
var usersList="";

request
    .get('https://127.0.0.1:9374/getSellerList')
    .on('response',function(error,response,body){
        console.log(response);
        console.log(error);
        console.log(body);
        usersList = body;
    })


/* GET users listing. */
router.all('/', function(req, res) {
   console.log("hhihi");
   console.log(usersList);
   res.render('index',{
    title:'Monitor for GPS Punch',
    users:usersList
  });
});

module.exports = router;
