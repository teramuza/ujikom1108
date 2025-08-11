'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('faktur_raja', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      no_faktur: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      due_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      metode_bayar: {
        type: Sequelize.ENUM('Cash', 'Transfer', 'Credit Card', 'Debit Card', 'Tempo'),
        allowNull: false,
        defaultValue: 'Cash'
      },
      ppn: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
      },
      dp: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
      },
      grand_total: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      user: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users_raja',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      id_customer: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'customer_raja',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      id_perusahaan: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'perusahaan_raja',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add index for better performance
    await queryInterface.addIndex('faktur_raja', ['no_faktur']);
    await queryInterface.addIndex('faktur_raja', ['user']);
    await queryInterface.addIndex('faktur_raja', ['id_customer']);
    await queryInterface.addIndex('faktur_raja', ['id_perusahaan']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('faktur_raja');
  }
};
