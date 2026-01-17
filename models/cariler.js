const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('cariler', {
    cari_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    cari_ad: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    bolge_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'bolgeler',
        key: 'bolge_id'
      }
    }
  }, {
    sequelize,
    tableName: 'cariler',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "cari_id" },
        ]
      },
      {
        name: "bolge_id",
        using: "BTREE",
        fields: [
          { name: "bolge_id" },
        ]
      },
    ]
  });
};
