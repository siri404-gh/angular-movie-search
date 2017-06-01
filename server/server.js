var express = require('express');
var https = require('https');
var app = express();
var fs = require('fs');
var bodyParser = require('body-parser');

var port = 3000;
var apiUrl = 'https://api.themoviedb.org/3';  // URL to web api
var apikey = 'd272326e467344029e68e3c4ff0b4059';
var locale='language=en-US';
var getMovie = '/movie/:id';
var addFavourite = '/favourite/:id';
var updateFavourite = '/favourite/:id';
var deleteFavourite = '/favourite/:id';
var getFavourites = '/favourites';
var host = 'api.themoviedb.org';
var apikey = 'd272326e467344029e68e3c4ff0b4059';
var db = './server/db.json';

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//presentation layer
app.use(express.static('./client/src/'));

//data layer
app.get(getMovie, (req, res) => {
  var options = {
    host: host,
    path: '/3/search/movie?api_key='+apikey+'&language=en-US&include_adult=false&query='+req.params.id,
    method: 'GET'
  };
  https.request(options, function(r) {
    r.setEncoding('utf8');
    r.on('data', function (chunk) {
      res.send(chunk);
    });
  }).end();
});

app.post(addFavourite, function(req, res) {
  var data = {
    id: req.params.id,
    title: req.body.title,
    poster: req.body.poster || '',
    description: req.body.description || ''
  }
  fs.readFile(db, (err, json) => {
    var toWrite = [];
    if(!err) {
      toWrite = JSON.parse(json);
    }
    toWrite.push(data);
    fs.writeFile(db, JSON.stringify(toWrite), (err) => {
      if (err) throw err;
      res.send('The movie has been saved');
    });
  });
});

app.get(getFavourites, function(req, res) {
  fs.readFile(db, (err, json) => {
    res.send(json);
  });
});

app.put(updateFavourite, function(req, res) {
  var data = {
    id: req.params.id,
    title: req.body.title,
    poster: req.body.poster || '',
    description: req.body.description || ''
  }

  fs.readFile(db, (err, json) => {
    if(!err) {
      var flag = false;
      var arr = JSON.parse(json);
      arr.forEach(function(a, i) {
        if(a.id === req.params.id) {
          arr[i] = data;
          flag = true;
        }
      });
      if(flag) {
        fs.writeFile(db, JSON.stringify(arr), (err) => {
            if (err) throw err;
            res.send('The movie has been updated');
        });
      }
    }
  });
});

app.delete(deleteFavourite, function(req, res) {
  fs.readFile(db, (err, json) => {
    if(!err) {
      var flag = false;
      var arr = JSON.parse(json);
      arr.forEach(function(a, i) {
        if(a.id === req.params.id) {
          arr.splice(i, 1);
          flag = true;
        }
      });
      if(flag) {
        fs.writeFile(db, JSON.stringify(arr), (err) => {
            if (err) throw err;
            res.send('The movie has been deleted');
        });
      }
    }
  });
});

app.listen(port, function () {
    console.log('Listening on port ' + port);
});