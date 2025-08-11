'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('customer_raja', [
      {
        nama_customer: 'Dr. Ahmad Fauzi',
        perusahaan_cust: 1, // RS Siloam Hospitals
        alamat: 'Jl. Kebayoran Baru No. 12, Jakarta Selatan',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama_customer: 'dr. Siti Nurhaliza',
        perusahaan_cust: 2, // RSUD Dr. Cipto Mangunkusumo
        alamat: 'Jl. Menteng Dalam No. 8, Jakarta Pusat',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama_customer: 'Farmasist Budi Santoso',
        perusahaan_cust: 3, // Klinik Kimia Farma
        alamat: 'Jl. Cempaka Putih No. 22, Jakarta Pusat',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama_customer: 'Rina Kusumawati',
        perusahaan_cust: 4, // Apotek Guardian
        alamat: 'Jl. Pondok Indah No. 45, Jakarta Selatan',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama_customer: 'dr. Hendra Wijaya',
        perusahaan_cust: 5, // Puskesmas Kecamatan Menteng
        alamat: 'Jl. Cikini Raya No. 30, Jakarta Pusat',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama_customer: 'Analis Dewi Sartika',
        perusahaan_cust: 6, // Laboratorium Prodia
        alamat: 'Jl. Salemba Raya No. 18, Jakarta Pusat',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama_customer: 'dr. Sp.PD Maria Ulfa',
        perusahaan_cust: 7, // RS Hermina Kemayoran
        alamat: 'Jl. Kemayoran Barat No. 25, Jakarta Pusat',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama_customer: 'Apt. Joni Setiawan',
        perusahaan_cust: 8, // Apotek Century
        alamat: 'Jl. Kebon Sirih No. 67, Jakarta Pusat',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama_customer: 'Ibu Sari Rahayu',
        perusahaan_cust: null, // Customer individual (tidak terkait perusahaan)
        alamat: 'Jl. Tebet Raya No. 88, Jakarta Selatan',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama_customer: 'Bapak Joko Widodo',
        perusahaan_cust: null, // Customer individual
        alamat: 'Jl. Mampang Prapatan No. 156, Jakarta Selatan',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama_customer: 'Ibu Ani Yudhoyono',
        perusahaan_cust: null, // Customer individual
        alamat: 'Jl. Cipete Raya No. 77, Jakarta Selatan',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama_customer: 'dr. Kartika Sari',
        perusahaan_cust: 1, // RS Siloam Hospitals
        alamat: 'Jl. Fatmawati No. 99, Jakarta Selatan',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('customer_raja', null, {});
  }
};
