const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('urun_satis', {
    satis_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'satislar',
        key: 'satis_id'
      }
    },
    urun_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'urunler',
        key: 'urun_id'
      }
    },
    adet: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    birim_fiyat: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'urun_satis',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "satis_id" },
          { name: "urun_id" },
        ]
      },
      {
        name: "urun_id",
        using: "BTREE",
        fields: [
          { name: "urun_id" },
        ]
      },
    ]
  });
};
