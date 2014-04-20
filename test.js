var apbd = require ('./')
var langsung = apbd.langsung;
var tidakLangsung = apbd.tidakLangsung;
var pendapatanDaerah = apbd.pendapatanDaerah;
var rancangan = apbd.rancangan;

describe ('Langsung', function(){
  it ('years', function (done){
    langsung.years(function(err, years){
      done(err);
    });
  });

  it ('categories', function (done){
    langsung.categories(2013, function(err, categories){
      done(err);
    });
  });

  it ('year table', function (done){
    langsung.yearTable(2013, function(err, categories){
      done(err);
    });
  });

  it ('category table per year', function (done){
    langsung.yearCategoryTable(2013, '1.01', function(err, categories){
      done(err);
    });
  });

  it.skip ('category activity table per year all', function (done){
    langsung.yearCategoryActivityTableAll(2013, '1.01', '0.08.01.00.0000.000', function(err, categories){
      done(err);
    });
  });
});

describe ('Tidak Langsung', function (){
  it ('years', function (done){
    tidakLangsung.years(function(err, years){
      done(err);
    });
  });

  it ('year table', function (done){
    tidakLangsung.yearTable(2013, function(err, categories){
      done(err);
    });
  });

  it ('year account table', function (done){
    tidakLangsung.yearAccountTable(2013, '1.20.001', function(err, categories){
      done(err);
    });
  });
});

describe ('Pendapatan Daerah', function (){
  it ('years', function (done){
    pendapatanDaerah.years(function(err, years){
      done(err);
    });
  });

  it ('year table', function (done){
    pendapatanDaerah.yearTable(2013, function(err, categories){
      done(err);
    });
  });

  it ('year account table', function (done){
    pendapatanDaerah.yearAccountTable(2013, '0.04.10.00.0000.000', function(err, categories){
      done(err);
    });
  });
});

describe ('Pendapatan Daerah', function (){
  it ('categories', function (done) {
    rancangan.categories(function(err, categories){
      console.log (rancangan.playerUrl(categories[0]));
      console.log (rancangan.firstImageUrl(categories[0]));
      done(err);
    });
  });
});