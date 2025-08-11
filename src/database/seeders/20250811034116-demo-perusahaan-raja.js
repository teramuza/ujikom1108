'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('perusahaan_raja', [
      {
        nama_perusahaan: 'RS Siloam Hospitals',
        alamat: 'Jl. Garnisun No. 1, Jakarta Pusat',
        no_telp: '021-5566789',
        fax: '021-5566790',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama_perusahaan: 'RSUD Dr. Cipto Mangunkusumo',
        alamat: 'Jl. Diponegoro No. 71, Jakarta Pusat',
        no_telp: '021-3914808',
        fax: '021-3914809',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama_perusahaan: 'Klinik Kimia Farma',
        alamat: 'Jl. Veteran No. 15, Jakarta Pusat',
        no_telp: '021-3456789',
        fax: '021-3456790',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama_perusahaan: 'Apotek Guardian',
        alamat: 'Jl. Sudirman No. 25, Jakarta Selatan',
        no_telp: '021-7890123',
        fax: '021-7890124',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama_perusahaan: 'Puskesmas Kecamatan Menteng',
        alamat: 'Jl. Menteng Raya No. 10, Jakarta Pusat',
        no_telp: '021-3141592',
        fax: '021-3141593',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama_perusahaan: 'Laboratorium Prodia',
        alamat: 'Jl. Kramat Raya No. 150, Jakarta Pusat',
        no_telp: '021-3190261',
        fax: '021-3190262',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama_perusahaan: 'RS Hermina Kemayoran',
        alamat: 'Jl. Benyamin Sueb No. 5, Jakarta Pusat',
        no_telp: '021-6545454',
        fax: '021-6545455',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama_perusahaan: 'Apotek Century',
        alamat: 'Jl. Thamrin No. 11, Jakarta Pusat',
        no_telp: '021-2358979',
        fax: '021-2358980',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('perusahaan_raja', null, {});
  }
};
