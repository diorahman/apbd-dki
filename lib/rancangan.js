var request = require ('request');
var cheerio = require ('cheerio');
var async = require ('async');
var ROOT = 'http://www.jakarta.go.id/web/apbdr'
var PLAYER = 'http://www.jakarta.go.id/web/uploads/embed/Dokumen RAPBD 2014 - :category/files/mobile/index.html'
var FIRST = 'http://www.jakarta.go.id/web/uploads/embed/Dokumen RAPBD 2014 - :category/files/res/mobile/page0001_i1.jpg' // todo automatic indexing

function getCategories(cb){
  request(ROOT, function (err, res, body){
    if (err) return cb (err);
    if (res.statusCode != 200) return cb (new Error(res.statusCode));
    var $ = cheerio.load(body);
    var categories = [];
    $("#EncyTabs ul li span").each(function(i, elem){
      categories.push($(this).text());
    });
    console.log(categories);
    return cb(null, categories);
  });
}

function playerUrl (category) {
  return PLAYER.split(':category').join(category);
}

function firstImageUrl (category) {
  return FIRST.split(':category').join(category);
}

module.exports = {
  categories : getCategories,
  playerUrl : playerUrl,
  firstImageUrl : firstImageUrl
}