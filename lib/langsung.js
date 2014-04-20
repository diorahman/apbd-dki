var request = require ('request');
var cheerio = require ('cheerio');
var async = require ('async');
var ROOT = 'http://www.jakarta.go.id/web/apbd'

function getYears(cb){
  request(ROOT + '/browse', function (err, res, body){
    if (err) return cb (err);
    if (res.statusCode != 200) return cb (new Error(res.statusCode));

    var $ = cheerio.load(body);
    var years = [];
    $("#EncyTabs ul li span").each(function(i, elem){
      years.push($(this).text());
    });
    return cb(null, years);
  });
}

function getCategories(year, cb) {
  request(ROOT + '/browse/' + year, function (err, res, body){
    if (err) return cb (err);
    if (res.statusCode != 200) return cb (new Error(res.statusCode));

    function getCode (url){
      var arr = url.split('/');
      return arr[arr.length - 3];
    }

    var $ = cheerio.load(body);
    var categories = [];
    $("#smoothmenu1 ul li a").each(function(i, elem){
      var category = {};
      category.code = getCode($(this).attr('href'));
      category.title = $(this).text().trim();
      categories.push(category);
    });
    return cb (null, categories);
  });
}

function getYearTable(year, cb) {
  request(ROOT + '/browse/' + year, function (err, res, body){
    if (err) return cb (err);
    if (res.statusCode != 200) return cb (new Error(res.statusCode));

    var $ = cheerio.load(body);
    var table = {};

    var headers = $('.table2 thead tr');
    var header = headers[0];
    var footer = headers[headers.length - 1];

    var codes = [];

    $(header).children().each(function(){
      codes.push ($(this).text());
    });

    $(footer).children('td').each(function(){
    });

    $('.table2 tbody tr').each(function(i, elem){
      var row = {};
      $(this).children('td').each(function(i, elem){
        var text = $(this).text().trim();
        row[codes[i]] = codes[i].indexOf('(Rp)') >= 0 ? Number(text.replace(/[^0-9\.]+/g, '')) : text;
        row[codes[i]] = 
          codes[i].indexOf('(%)') >= 0 
          || codes[i].indexOf('Jumlah') >= 0 ? 
          Number(row[codes[i]]) : row[codes[i]];

      });
      table.rows = table.rows || [];
      table.rows.push(row);
    });
    console.log (table.rows[0]);
    return cb (null, table);
  });
}

function getYearCategoryTable(year, code, cb) {
  request(ROOT + '/category/' + code + '/' + year, function (err, res, body){
    if (err) return cb (err);
    if (res.statusCode != 200) return cb (new Error(res.statusCode));

    var $ = cheerio.load(body);
    var table = {};

    var headers = $('.table2 thead tr');
    var header = headers[0];
    var codes = [];

    $(header).children().each(function(){
      if ($(this).text().indexOf('DPA (%)') >= 0) {
        var arr = $(this).text().split(' ');
        codes.push ( arr.join(" per Tahun "));
        codes.push ( arr.join(" per Urusan "));
      } else {
        codes.push ($(this).text());
      }
    });

    $('.table2 tbody tr').each(function(i, elem){
      var row = {};
      $(this).children('td').each(function(i, elem){
        var text = $(this).text().trim();
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
      table.rows = table.rows || [];
      table.rows.push(row);
    });
    console.log (table.rows[0]);
    return cb (null, table);
  });
}

function getYearCategoryActivityTable(options, cb) {

  var code = options.code;
  var year = options.year;
  var activity = options.activity;
  var page = options.count;

  var url = ROOT + '/kegiatan/' + code + '/' + year + '/' + activity + '/' + code;
  url = page ? 
    ROOT + '/kegiatan/0/' + code + '-' + year + '-' + activity + '-' + code + '/1/' + page
    : url;

  request(url, function (err, res, body){

    if (err) return cb (err);
    if (res.statusCode != 200) return cb (new Error(res.statusCode));

    var table = {};

    var $ = cheerio.load(body);
    var table = {};

    var headers = $('.table2 thead tr');
    var header = headers[0];
    var footer = headers[headers.length - 1];
    var codes = [];

    $(header).children().each(function(){
      if ($(this).text().indexOf('DPA (%)') >= 0) {
        var arr = $(this).text().split(' ');
        codes.push ( arr.join(" per Tahun "));
        codes.push ( arr.join(" per Urusan "));
        codes.push ( arr.join(" per SKPD "));
      } else {
        codes.push ($(this).text());
      }
    });

    var container = $('#EncyTabs').siblings('table');
    var containerRows = container.children('tr');
    var pagination = containerRows[containerRows.length -1];

    var pages = $(pagination).children().find('a');
    var last = pages[pages.length - 1];
    var total = $(last).attr('href').split('/').pop();
    total = Number(total);

    $('.table2 tbody tr').each(function(i, elem){
      var row = {};
      $(this).children('td').each(function(i, elem){
        var text = $(this).text().trim();
        row[codes[i]] = 
          codes[i].indexOf('(Rp)') >= 0 
          || codes[i].indexOf('Realisasi') >= 0 
          ? Number(text.replace(/[^0-9\.]+/g, '')) : text;
        row[codes[i]] = 
          codes[i].indexOf('(%)') >= 0 
          || codes[i].indexOf('Jumlah') >= 0 
          ? Number(row[codes[i]]) : row[codes[i]];
      });
      table.rows = table.rows || [];
      table.rows.push(row);
    });
    table.total = total;
    return cb (null, table);
  });
}

function getYearCategoryActivityTableAll(year, code, activity, cb) {

  var options = {
    code : code,
    activity : activity,
    year : year
  };

  getYearCategoryActivityTable(options, function(err, table){
    if (err) return cb(err);

    var pages = [];
    var start = 0;
    for (var i = 0; i <= table.total/20; i++) {
      var page = {
        count : start,
        code : code,
        activity : activity,
        year : year
      }
      pages.push(page);
      start += 20;
    }

    async.mapSeries(pages, getYearCategoryActivityTable, function(err, result){
      if (err) return cb (err);
      var all = {};
      result.forEach(function(table){
        all.rows = all.rows || [];
        all.rows = all.rows.concat(table.rows);
      });
      console.log (JSON.stringify(all, null, 2));
      cb (null, all);
    });
  });
}


module.exports = {
  years : getYears,
  categories : getCategories,
  yearTable : getYearTable,
  yearCategoryTable : getYearCategoryTable,
  yearCategoryActivityTable : getYearCategoryActivityTable,
  yearCategoryActivityTableAll : getYearCategoryActivityTableAll
}