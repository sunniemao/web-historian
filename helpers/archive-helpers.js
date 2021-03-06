var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var http = require('http');
/*
 * You will need to reuse the same paths many times over in the course of this sprint.
 * Consider using the `paths` object below to store frequently used file paths. This way,
 * if you move any files, you'll only need to change your code in one place! Feel free to
 * customize it in any way you wish.
 */

exports.paths = {
  siteAssets: path.join(__dirname, '../web/public'),
  archivedSites: path.join(__dirname, '../archives/sites'),
  list: path.join(__dirname, '../archives/sites.txt')
};

// Used for stubbing paths for tests, do not modify
exports.initialize = function(pathsObj) {
  _.each(pathsObj, function(path, type) {
    exports.paths[type] = path;
  });
};

// The following function names are provided to you to suggest how you might
// modularize your code. Keep it clean!

exports.readListOfUrls = function(callback) {
  
  fs.readFile(exports.paths.list, 'utf8', (err, data) => { 
    if (err) {
      console.log(err);
    } else {
      var data = data.split('\n');
     
      callback(err, data);
    }
      //return body.split('\n');
  });
};

exports.isUrlInList = function(url, callback) {
  fs.readFile(exports.paths.list, 'utf8', (err, data) => {
    if (err) {
      console.log(err);
    }
    var data = data.split('\n');
    if (data.indexOf(url) > -1) {
      callback(err, true);
    } else {
      callback(err, false);
    } 
  });

};

exports.addUrlToList = function(url, callback) {
  fs.appendFile(exports.paths.list, url, (err) => { 
    if (err) {
      console.log(err);
    } else {
      callback(err);
    }
  });
};

// may need to replace appendFile with writefile

exports.isUrlArchived = function(url, callback) {
  var path = exports.paths.archivedSites + '/' + url;
  fs.stat(path, function(err, stat) {
    if (!err) {
      callback(null, true);
    } else if (err.code === 'ENOENT') {
      callback(null, false);
    } else {
      callback(err, false);
    }
  });
};

exports.downloadUrls = function(urlArray, callback) {
  _.each(urlArray, function(url) {
    exports.isUrlArchived(url, function(err, exists) {
      if (err) {
        console.log(err);
      } else if (exists) {
        //do nothing
      } else {
        var urlStr = 'http://' + url; 
        http.get(urlStr, function(res) {
          if (res.statusCode !== 200) {
            console.log(err);
          } else {
            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => rawData += chunk);
            res.on('end', () => {
              console.log(rawData);
              fs.writeFile(exports.paths.archivedSites + '/' + url, rawData);
            });
          }
        });
      }
    });
  });
};