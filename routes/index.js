var express = require('express');
var app = express.Router();
var mysql      = require('mysql');
var log4js = require('log4js');
log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file('logs/apiError.log'), 'indexJsRouteLogs');
var logger = log4js.getLogger('indexJsRouteLogs');
logger.debug("Starting logger");

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'gpsPunch'
});

connection.connect(function(err) {
    if (err) {
        logger.error('error connecting: ' + err.stack);
        //console.error('error connecting: ' + err.stack);
        return;
    }
    logger.info('connected as id ' + connection.threadId);
    //console.log('connected as id ' + connection.threadId);
});

/*
Status tags
--------------
1 - Starting to sell
2 - Returning to office
3 - Directly returning home
0 - Inactive
*/

app.use(function(req,res,next){
    logger.debug(req.ips);
    logger.debug(req.hostname);
    logger.debug(req.body);
    next();
});

// accept POST request on the homepage
app.post('/setLocation', function (req, res) {
    logger.debug(req.body);
    var count=0;
    for (key in req.body) {
        if (req.body.hasOwnProperty(key)) {
            count++;
        }
    }
    console.log(count);
   // if(count == 4 && req.body.id != "" && req.body.lat!="" && req.body.lng!="" && req.body.status!="") {
    if(count ==3 && req.body.id != "" && req.body.lat!="" && req.body.lng!="" ) {
        var postData = {
            id: req.body.id,
            lat: req.body.lat,
            lng: req.body.lng,
            status: '0'
        };
        //console.log(postData);
        logger.info("setLocation -- " + JSON.stringify(postData));
        connection.query('INSERT into logs SET ?', postData, function (err, rows, fields) {
            if (err) {
                logger.error('Error executing query: ' + err.stack);
                //  console.error('Error executing query: ' + err.stack);
                return;
            }
        });
//    res.header("Access-Control-Allow-Origin", "*");
//    res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.json({"200": "OK"});
    }
    else res.json({"404":"Check input data"});
  });

//connection.end();
app.post('/updateStatus/:id', function (req, res) {
    logger.debug(req.body);
    var count=0;
    for (key in req.body) {
        if (req.body.hasOwnProperty(key)) {
            count++;
        }
    }
    console.log(count);
    if(count == 4 && req.body.id != "" && req.body.lat!="" && req.body.lng!="" && req.body.status!="") {
        var postData = {
            id: req.body.id,
            lat: req.body.lat,
            lng: req.body.lng,
            status:req.body.status
        };
        //console.log(postData);
        logger.info("setLocation -- " + JSON.stringify(postData));
        connection.query('INSERT into logs SET ?', postData, function (err, rows, fields) {
            if (err) {
                logger.error('Error executing query: ' + err.stack);
                //  console.error('Error executing query: ' + err.stack);
                return;
            }
        });
//    res.header("Access-Control-Allow-Origin", "*");
//    res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.json({"200": "OK"});
    }
    //else res.json({"404":"Check input data"});
    else res.sendStatus(404);
});


app.get('/getLastLocation/:id',function(req,res){
    connection.query('SELECT lat,lng,timestamp from logs where id = ? order by timestamp desc limit 1',req.params.id, function(err, rows, fields) {
        if (err) {
            logger.error('Error executing query: ' + err.stack);
      //      console.error('Error executing query: ' + err.stack);
            return;
        }
        logger.info("getLastLocation -- "+req.params.id);
        if (rows.length < 1) {
            res.json({"404": "Does not exists"});
        }
        else res.json(rows);
        //console.log('The solution is: ', rows);

    });
});

app.get('/getLocationHistory/:id',function(req,res) {
    logger.info("getLocationHistory -- " + req.params.id);
    connection.query('SELECT lat,lng,timestamp from logs where id = ? order by timestamp desc', req.params.id, function (err, rows, fields) {
        if (err) {
            logger.error('Error executing query: ' + err.stack);
            //    console.error('Error executing query: ' + err.stack);
            return;
        }
        if (rows.length < 1) {
            res.json({"404": "Does not exists"});
        }
        else res.json({"id": req.params.id, "history": rows});
        //console.log('The solution is: ', rows);

    });
});


app.get('/getSellerList',function(req,res) {
    logger.info("getSellerList -- ");
    connection.query('SELECT DISTINCT(id) from logs order by timestamp desc', function (err, rows, fields) {
        if (err) {
            logger.error('Error executing query: ' + err.stack);
            //    console.error('Error executing query: ' + err.stack);
            return;
        }
        if (rows.length < 1) {
            res.json({"404": "Does not exists"});
        }
        else res.json(rows);
        //console.log('The solution is: ', rows);

    });
});

app.get('/getStatus/:id',function(req,res) {
    logger.info("getStatus -- ");
    connection.query('SELECT status from logs where id = ? and date(timestamp) = date(CURDATE()) order by timestamp desc limit 1 ',req.params.id, function (err, rows, fields) {
        if (err) {
            logger.error('Error executing query: ' + err.stack);
            //    console.error('Error executing query: ' + err.stack);
            return;
        }

        if (rows.length < 1) {
            res.json({"404": "Does not exists"});
        }
        else res.json(rows);
        //console.log('The solution is: ', rows);

    });
});

//select status from logs where date("timestamp") = CURDATE() order by timestamp desc limit 1
app.get('/getTodayStatus/:id',function(req,res) {
    logger.info("getStatus -- ");
    connection.query('select status from logs where date(timestamp) = CURDATE() and id = ? order by timestamp desc limit 1',req.params.id, function (err, rows, fields) {
        if (err) {
            logger.error('Error executing query: ' + err.stack);
            //    console.error('Error executing query: ' + err.stack);
            return;
        }
        if (rows.length < 1) {
            res.json({"404": "Does not exists"});
        }
        else res.json(rows);
        //console.log('The solution is: ', rows);

    });
});




 /*app.all('/', function (req, res) {
     res.json({"404":"Not found"});
 });*/



module.exports = app;
