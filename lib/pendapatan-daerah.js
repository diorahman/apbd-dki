var request = require ('request');
var cheerio = require ('cheerio');
var async = require ('async');
var ROOT = 'http://www.jakarta.go.id/web/apbdpt'

function getYears(cb){
  request(ROOT, function (err, res, body){
    if (err) return cb (err);
    if (res.statusCode != 200) return cb (new Error(res.statusCode));
    var $ = cheerio.load(body);
    var years = [];
    $("#EncyTabs ul li span").each(function(i, elem){
      years.push($(this).text());
    });
    console.log(years);
    return cb(null, years);
  });
}

function getYearTable(year, cb){
  request (ROOT + '/browse/' + year, function (err, res, body){
    if (err) return cb (err);
    if (res.statusCode != 200) return cb (new Error(res.statusCode));
    var $ = cheerio.load(body);

    var ret = {};

    var tables = $('table');
    var table = tables[tables.length - 2];
    var lines = $(table).children();
    var header = lines[0];
    var footer = lines[lines.length - 1];
    var rows = [];
    var codes = [];

    $(header).children().each(function(){
      codes.push ($(this).text());
    });

    for (var k = 1; k < lines.length - 1; k++) {
      var row = {};
      $(lines[k]).children().each(function(i, elem){
        var text = $(this).text().trim();
        var anchor = $(this).children('a');
        if (anchor) {
          $(anchor).each(function(){
            row['Kode'] = $(this).attr('href').split('/').pop();
          });
        }
        row[codes[i]] = 
          codes[i].indexOf('(Rp)') >= 0 
          || codes[i].indexOf('Realisasi') >= 0 
          ? Number(text.replace(/[^0-9\.]+/g, '')) : text;
        row[codes[i]] = 
          codes[i].indexOf('(%)') >= 0 
          || codes[i].indexOf('Jumlah') >= 0
          || codes[i].indexOf('Kegiatan') >= 0
           ? 
          Number(row[codes[i]]) : row[codes[i]];
      });
      rows.push(row);
    }

    ret.rows = rows;
    cb (null, ret);
  });
}

function getYearAccountTable(year, code, cb) {
  request (ROOT + '/rekening/' + year + '/' + code, function (err, res, body){
    if (err) return cb (err);
    if (res.statusCode != 200) return cb (new Error(res.statusCode));
    var $ = cheerio.load(body);

    var ret = {};

    var tables = $('table');
    var table = tables[tables.length - 2];
    var lines = $(table).children();
    var header = lines[0];
    var footer = lines[lines.length - 1];
    var title = $('#content div').text().split(":").pop().trim();
    var rows = [];
    var codes = [];

    $(header).children().each(function(){
      codes.push ($(this).text());
    });

    for (var k = 1; k < lines.length - 1; k++) {
      var row = {};
      $(lines[k]).children().each(function(i, elem){
        var text = $(this).text().trim();
        var anchor = $(this).children('a');
        if (anchor) {
          $(anchor).each(function(){
            row['Kode'] = $(this).attr('href').split('/').pop();
          });
        }
        row[codes[i]] = 
          codes[i].indexOf('(Rp)') >= 0 
          || codes[i].indexOf('Realisasi') >= 0 
          ? Number(text.replace(/[^0-9\.]+/g, '')) : text;
        row[codes[i]] = 
          codes[i].indexOf('(%)') >= 0 
          || codes[i].indexOf('Jumlah') >= 0
          || codes[i].indexOf('Kegiatan') >= 0
           ? 
          Number(row[codes[i]]) : row[codes[i]];
      });
      rows.push(row);
    }
    ret.title = title;
    ret.rows = rows;
    console.log (ret);
    cb(null, ret);
  });
}

module.exports = {
  years : getYears,
  yearTable : getYearTable,
  yearAccountTable : getYearAccountTable
}