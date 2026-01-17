var DataTypes = require("sequelize").DataTypes;
var _bolgeler = require("./bolgeler");
var _cariler = require("./cariler");
var _grup = require("./grup");
var _satislar = require("./satislar");
var _urun_satis = require("./urun_satis");
var _urunler = require("./urunler");

function initModels(sequelize) {
  var bolgeler = _bolgeler(sequelize, DataTypes);
  var cariler = _cariler(sequelize, DataTypes);
  var grup = _grup(sequelize, DataTypes);
  var satislar = _satislar(sequelize, DataTypes);
  var urun_satis = _urun_satis(sequelize, DataTypes);
  var urunler = _urunler(sequelize, DataTypes);

  satislar.belongsToMany(urunler, { as: 'urun_id_urunlers', through: urun_satis, foreignKey: "satis_id", otherKey: "urun_id" });
  urunler.belongsToMany(satislar, { as: 'satis_id_satislars', through: urun_satis, foreignKey: "urun_id", otherKey: "satis_id" });
  cariler.belongsTo(bolgeler, { as: "bolge", foreignKey: "bolge_id"});
  bolgeler.hasMany(cariler, { as: "carilers", foreignKey: "bolge_id"});
  satislar.belongsTo(cariler, { as: "cari", foreignKey: "cari_id"});
  cariler.hasMany(satislar, { as: "satislars", foreignKey: "cari_id"});
  urunler.belongsTo(grup, { as: "grup", foreignKey: "grup_id"});
  grup.hasMany(urunler, { as: "urunlers", foreignKey: "grup_id"});
  urun_satis.belongsTo(satislar, { as: "sati", foreignKey: "satis_id"});
  satislar.hasMany(urun_satis, { as: "urun_satis", foreignKey: "satis_id"});
  urun_satis.belongsTo(urunler, { as: "urun", foreignKey: "urun_id"});
  urunler.hasMany(urun_satis, { as: "urun_satis", foreignKey: "urun_id"});

  return {
    bolgeler,
    cariler,
    grup,
    satislar,
    urun_satis,
    urunler,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
