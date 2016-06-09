//express-sample/app.js
var express = require('express');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
//---Model---//
var con = mongoose.connect('mongodb://mamo:mamo-pass@localhost/memo');
var db = con.connection;
// 接続確認結果
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(callback) {
  console.log("connection successfully");
});

var Schema = mongoose.Schema;
var memoSchema = new Schema({
  title: String,
  content: String,
  date: Date
});
memoSchema.pre('save', function(next) {
  this.date = new Date();
  next();
});
var Memo = mongoose.model('Memo', memoSchema);

//---Controller---//
var app = express();
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });
//ミドルウェア設定を追加
app.use(express.static('public'));
app.use(favicon('public/favicon.ico'));

//ルーティング設定
app.get('/', function(req, res) {
    res.send('Hello World');
});

app.get('/memo', function (req, res, next) {
    console.log("get memolist");
    Memo.find({}, function (err, data) {
        if (err) {
            return next(err);
        }
        res.json(data);
    });
});

app.get('/memo/:id', function (req, res, next) {
    console.log("get memo : " + req.params.id);
    Memo.findById(req.params.id, function (err, data) {
        if (err) {
            return next(err);
        }
        res.json(data);
    });
});

app.post('/memo', jsonParser, function (req, res, next) {
    res.setHeader('Content-Type', 'text/plain');
    console.log("post memo : " + req.body.content);
    var memo = new Memo();
    memo.title = req.body.title;
    memo.content = req.body.content;
    memo.save(function (err) {
        if (err) {
            return next(err);
        }
        res.json(memo);
    });
});

app.put('/memo/:id', jsonParser, function (req, res, next) {
    res.setHeader('Content-Type', 'text/plain');
    console.log("put memo : " + req.params.id);
    console.log(req.body.content);
    Memo.findById(req.params.id, function (err, data) {
        if (err) {
            return next(err);
        }
        data.title = req.body.title;
        data.content = req.body.content;
        data.save(function (err) {
            if (err) {
                return next(err);
            }
            res.json(data);
        });
    });
});

app.delete('/memo/:id', jsonParser, function (req, res, next) {
    res.setHeader('Content-Type', 'text/plain');
    console.log("delete memo : " + req.params.id);
    Memo.findById(req.params.id, function (err, data) {
        if (err) {
            return next(err);
        }
        data.remove(function (err) {
            console.log("memo remove!");
            res.json(data);
        });
    });
});
    
app.listen(3000);
console.log('Server running at http://localhost:3000/');
