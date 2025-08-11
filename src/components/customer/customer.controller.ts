import { Request, Response } from 'express';
import db from '@model';
import BaseController from '@lib/base/BaseController';
import {col, fn, Op} from 'sequelize';

class CustomerController extends BaseController {

    // Get all customers with pagination and search
    public async getAllCustomer(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string;
            const perusahaan_id = req.query.perusahaan_id as string;
            const individual = req.query.individual === 'true'; // Filter individual customers

            const offset = (page - 1) * limit;

            const whereClause: any = {};

            if (search) {
                whereClause[Op.or] = [
                    { nama_customer: { [Op.iLike]: `%${search}%` } },
                    { alamat: { [Op.iLike]: `%${search}%` } }
                ];
            }

            if (perusahaan_id && !isNaN(parseInt(perusahaan_id))) {
                whereClause.perusahaan_cust = parseInt(perusahaan_id);
            }

            if (individual) {
                whereClause.perusahaan_cust = null;
            }

            const { count, rows } = await db.Customer.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: db.Perusahaan,
                        as: 'perusahaan',
                        attributes: ['id', 'nama_perusahaan', 'alamat'],
                        required: false
                    }
                ],
                limit,
                offset,
                order: [['nama_customer', 'ASC']]
            });

            const totalPages = Math.ceil(count / limit);

            res.status(200).json({
                message: 'Data customer berhasil diambil',
                data: rows,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems: count,
                    itemsPerPage: limit
                }
            });
        } catch (error: any) {
            res.status(500).json({
                message: 'Error mengambil data customer',
                error: error.message
            });
        }
    }

    // Get customer by ID
    public async getCustomerById(req: Request, res: Response) {
        try {
            const { id } = req.params;

            if (!id || isNaN(parseInt(id))) {
                return res.status(400).json({ message: 'ID customer tidak valid' });
            }

            const customer = await db.Customer.findByPk(id, {
                include: [
                    {
                        model: db.Perusahaan,
                        as: 'perusahaan',
                        attributes: ['id', 'nama_perusahaan', 'alamat', 'no_telp', 'fax'],
                        required: false
                    }
                ]
            });

            if (!customer) {
                return res.status(404).json({ message: 'Customer tidak ditemukan' });
            }

            res.status(200).json({
                message: 'Data customer berhasil diambil',
                data: customer
            });
        } catch (error: any) {
            res.status(500).json({
                message: 'Error mengambil data customer',
                error: error.message
            });
        }
    }

    // Create new customer
    public async createCustomer(req: Request, res: Response) {
        try {
            const { nama_customer, perusahaan_cust, alamat } = req.body;

            if (!nama_customer) {
                return res.status(400).json({
                    message: 'Nama customer wajib diisi'
                });
            }

            // Validate perusahaan if provided
            if (perusahaan_cust) {
                const perusahaan = await db.Perusahaan.findByPk(perusahaan_cust);
                if (!perusahaan) {
                    return res.status(400).json({
                        message: 'Perusahaan tidak ditemukan'
                    });
                }
            }

            const customer = await db.Customer.create({
                nama_customer,
                perusahaan_cust: perusahaan_cust || null,
                alamat: alamat || null
            });

            // Get customer with perusahaan data
            const customerWithPerusahaan = await db.Customer.findByPk(customer.id, {
                include: [
                    {
                        model: db.Perusahaan,
                        as: 'perusahaan',
                        attributes: ['id', 'nama_perusahaan'],
                        required: false
                    }
                ]
            });

            res.status(201).json({
                message: 'Customer berhasil dibuat',
                data: customerWithPerusahaan
            });
        } catch (error: any) {
            res.status(500).json({
                message: 'Error membuat customer',
                error: error.message
            });
        }
    }

    // Update customer
    public async updateCustomer(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { nama_customer, perusahaan_cust, alamat } = req.body;

            if (!id || isNaN(parseInt(id))) {
                return res.status(400).json({ message: 'ID customer tidak valid' });
            }

            const customer = await db.Customer.findByPk(id);
            if (!customer) {
                return res.status(404).json({ message: 'Customer tidak ditemukan' });
            }

            // Validate perusahaan if provided
            if (perusahaan_cust) {
                const perusahaan = await db.Perusahaan.findByPk(perusahaan_cust);
                if (!perusahaan) {
                    return res.status(400).json({
                        message: 'Perusahaan tidak ditemukan'
                    });
                }
            }

            // Update fields
            const updateData: any = {};
            if (nama_customer !== undefined) updateData.nama_customer = nama_customer;
            if (perusahaan_cust !== undefined) updateData.perusahaan_cust = perusahaan_cust;
            if (alamat !== undefined) updateData.alamat = alamat;

            await customer.update(updateData);

            // Get updated customer with perusahaan data
            const updatedCustomer = await db.Customer.findByPk(id, {
                include: [
                    {
                        model: db.Perusahaan,
                        as: 'perusahaan',
                        attributes: ['id', 'nama_perusahaan'],
                        required: false
                    }
                ]
            });

            res.status(200).json({
                message: 'Customer berhasil diupdate',
                data: updatedCustomer
            });
        } catch (error: any) {
            res.status(500).json({
                message: 'Error mengupdate customer',
                error: error.message
            });
        }
    }

    // Delete customer
    public async deleteCustomer(req: Request, res: Response) {
        try {
            const { id } = req.params;

            if (!id || isNaN(parseInt(id))) {
                return res.status(400).json({ message: 'ID customer tidak valid' });
            }

            const customer = await db.Customer.findByPk(id);
            if (!customer) {
                return res.status(404).json({ message: 'Customer tidak ditemukan' });
            }

            // Check if customer is used in faktur
            const isUsedInFaktur = await db.Faktur.findOne({
                where: { id_customer: id }
            });

            if (isUsedInFaktur) {
                return res.status(400).json({
                    message: 'Customer tidak dapat dihapus karena sudah digunakan dalam faktur'
                });
            }

            await customer.destroy();

            res.status(200).json({
                message: 'Customer berhasil dihapus'
            });
        } catch (error: any) {
            res.status(500).json({
                message: 'Error menghapus customer',
                error: error.message
            });
        }
    }

    // Get customers by perusahaan
    public async getCustomersByPerusahaan(req: Request, res: Response) {
        try {
            const { perusahaan_id } = req.params;

            if (!perusahaan_id || isNaN(parseInt(perusahaan_id))) {
                return res.status(400).json({ message: 'ID perusahaan tidak valid' });
            }

            const customers = await db.Customer.findAll({
                where: { perusahaan_cust: perusahaan_id },
                include: [
                    {
                        model: db.Perusahaan,
                        as: 'perusahaan',
                        attributes: ['id', 'nama_perusahaan']
                    }
                ],
                order: [['nama_customer', 'ASC']]
            });

            res.status(200).json({
                message: 'Data customer berdasarkan perusahaan berhasil diambil',
                data: customers
            });
        } catch (error: any) {
            res.status(500).json({
                message: 'Error mengambil data customer berdasarkan perusahaan',
                error: error.message
            });
        }
    }

    // Get individual customers (not linked to any company)
    public async getIndividualCustomers(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string;

            const offset = (page - 1) * limit;

            const whereClause: any = {
                perusahaan_cust: null
            };

            if (search) {
                whereClause[Op.or] = [
                    { nama_customer: { [Op.iLike]: `%${search}%` } },
                    { alamat: { [Op.iLike]: `%${search}%` } }
                ];
            }

            const { count, rows } = await db.Customer.findAndCountAll({
                where: whereClause,
                limit,
                offset,
                order: [['nama_customer', 'ASC']]
            });

            const totalPages = Math.ceil(count / limit);

            res.status(200).json({
                message: 'Data customer individual berhasil diambil',
                data: rows,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems: count,
                    itemsPerPage: limit
                }
            });
        } catch (error: any) {
            res.status(500).json({
                message: 'Error mengambil data customer individual',
                error: error.message
            });
        }
    }

    // Get customer statistics
    public async getCustomerStats(req: Request, res: Response) {
        try {
            const totalCustomers = await db.Customer.count();
            const individualCustomers = await db.Customer.count({
                where: { perusahaan_cust: null }
            });
            const corporateCustomers = totalCustomers - individualCustomers;

            const customersByCompany = await db.Customer.findAll({
                attributes: [
                    [fn('COUNT', col('Customer.id')), 'customer_count']
                ],
                include: [
                    {
                        model: db.Perusahaan,
                        as: 'perusahaan',
                        attributes: ['id', 'nama_perusahaan'],
                        required: true
                    }
                ],
                group: ['perusahaan.id', 'perusahaan.nama_perusahaan'],
                order: [[fn('COUNT', col('Customer.id')), 'DESC']],
                limit: 10
            });

            res.status(200).json({
                message: 'Statistik customer berhasil diambil',
                data: {
                    total_customers: totalCustomers,
                    individual_customers: individualCustomers,
                    corporate_customers: corporateCustomers,
                    customers_by_company: customersByCompany
                }
            });
        } catch (error: any) {
            res.status(500).json({
                message: 'Error mengambil statistik customer',
                error: error.message
            });
        }
    }
}

export default new CustomerController();
