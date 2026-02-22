/**
 * PendingOtp model - stores OTP-pending sign-in sessions.
 */

const { DataTypes, Sequelize } = require('sequelize');

module.exports = (sequelize) => {
  const PendingOtp = sequelize.define('PendingOtp', {
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
    device: {
      type: DataTypes.JSON,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    tableName: 'pending_otp',
    timestamps: false,
    createdAt: 'created_at',
    updatedAt: false
  });

  return PendingOtp;
};
