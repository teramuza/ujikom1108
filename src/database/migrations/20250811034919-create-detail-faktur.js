'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('detail_faktur_raja', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_produk: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'produk_raja',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      no_faktur: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'faktur_raja',
          key: 'no_faktur'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      qty: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      price: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      subtotal: {
        type: Sequelize.FLOAT,
        allowNull: false
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

    // Add composite index for better performance
    await queryInterface.addIndex('detail_faktur_raja', ['no_faktur']);
    await queryInterface.addIndex('detail_faktur_raja', ['id_produk']);
    await queryInterface.addIndex('detail_faktur_raja', ['no_faktur', 'id_produk']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('detail_faktur_raja');
  }
};
