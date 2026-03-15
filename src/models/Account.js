/**
 * Account model - stores linked Syriatel Cash accounts.
 */

const { DataTypes, Sequelize } = require('sequelize');

module.exports = (sequelize) => {
  const Account = sequelize.define('Account', {
    api_key: {
      type: DataTypes.STRING(64),
      primaryKey: true,
      allowNull: false
    },
    gsm: {
      type: DataTypes.STRING(24),
      allowNull: false
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    account_id: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    user_id: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    user_key: {
      type: DataTypes.STRING(128),
      allowNull: false
    },
    account_data: {
      type: DataTypes.JSON,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null
    },
    pin: {
      type: DataTypes.STRING(32),
      allowNull: true,
      defaultValue: null
    },
    device: {
      type: DataTypes.JSON,
      allowNull: false
    },
    linked_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    tableName: 'accounts',
    timestamps: false,
    updatedAt: 'updated_at',
    createdAt: 'created_at',
  });

  return Account;
};
