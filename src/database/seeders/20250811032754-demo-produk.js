'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('produk_raja', [
      {
        nama_produk: 'Paracetamol 500mg',
        price: 5000.00,
        jenis: 'Obat Bebas',
        stock: 500,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama_produk: 'Amoxicillin 500mg',
        price: 15000.00,
        jenis: 'Antibiotik',
        stock: 200,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama_produk: 'Vitamin C 1000mg',
        price: 25000.00,
        jenis: 'Vitamin',
        stock: 300,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama_produk: 'Antimo Tablet',
        price: 8000.00,
        jenis: 'Obat Bebas',
        stock: 150,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama_produk: 'Betadine Solution 15ml',
        price: 12000.00,
        jenis: 'Antiseptik',
        stock: 100,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama_produk: 'Omeprazole 20mg',
        price: 35000.00,
        jenis: 'Obat Keras',
        stock: 80,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama_produk: 'Hansaplast Strip 20pcs',
        price: 18000.00,
        jenis: 'Alat Kesehatan',
        stock: 250,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama_produk: 'Thermometer Digital',
        price: 45000.00,
        jenis: 'Alat Kesehatan',
        stock: 50,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama_produk: 'Masker Medis 50pcs',
        price: 30000.00,
        jenis: 'Alat Pelindung',
        stock: 400,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama_produk: 'Hand Sanitizer 100ml',
        price: 15000.00,
        jenis: 'Antiseptik',
        stock: 200,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama_produk: 'Ibuprofen 400mg',
        price: 8500.00,
        jenis: 'Obat Bebas',
        stock: 300,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama_produk: 'Kapas Steril 25gr',
        price: 6000.00,
        jenis: 'Alat Kesehatan',
        stock: 180,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama_produk: 'Salep Luka Bakar 10gr',
        price: 22000.00,
        jenis: 'Obat Luar',
        stock: 120,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama_produk: 'Multivitamin Dewasa',
        price: 65000.00,
        jenis: 'Vitamin',
        stock: 90,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama_produk: 'Sirup Batuk Anak 60ml',
        price: 18500.00,
        jenis: 'Obat Bebas',
        stock: 160,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('produk_raja', null, {});
  }
};
