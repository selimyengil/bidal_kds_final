const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('urunler', {
    urun_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    urun_ad: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    grup_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'grup',
        key: 'grup_id'
      }
    },
    gramaj: {
      type: DataTypes.DECIMAL(10,3),
      allowNull: false
    },
    guncel_fiyat: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'urunler',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "urun_id" },
        ]
      },
      {
        name: "grup_id",
        using: "BTREE",
        fields: [
          { name: "grup_id" },
        ]
      },
    ]
  });
};
