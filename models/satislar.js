const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('satislar', {
    satis_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    tarih: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    cari_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'cariler',
        key: 'cari_id'
      }
    },
    toplam_tutar: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'satislar',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "satis_id" },
        ]
      },
      {
        name: "cari_id",
        using: "BTREE",
        fields: [
          { name: "cari_id" },
        ]
      },
    ]
  });
};
