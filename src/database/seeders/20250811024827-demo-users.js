'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Hash passwords before inserting
    const hashedPassword1 = await bcrypt.hash('admin123', 10);
    const hashedPassword2 = await bcrypt.hash('admin123', 10);
    const hashedPassword3 = await bcrypt.hash('admin123', 10);

    await queryInterface.bulkInsert('users_raja', [
      {
        username: 'admin',
        pass: hashedPassword1,
        name: 'Tera',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'admin1',
        pass: hashedPassword2,
        name: 'Raja',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'admin2',
        pass: hashedPassword3,
        name: 'Teuku',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users_raja', null, {});
  }
};
