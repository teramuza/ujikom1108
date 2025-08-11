import { Request, Response } from 'express';
import db, { sequelize } from '@model';
import BaseController from '@lib/base/BaseController';
import {col, fn, Op, QueryTypes} from 'sequelize';

class PerusahaanController extends BaseController {

    // Get all perusahaan with pagination and search
    public async getAllPerusahaan(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string;
            const withCustomers = req.query.withCustomers === 'true';

            const offset = (page - 1) * limit;

            const whereClause: any = {};

            if (search) {
                whereClause[Op.or] = [
                    { nama_perusahaan: { [Op.iLike]: `%${search}%` } },
                    { alamat: { [Op.iLike]: `%${search}%` } }
                ];
            }

            const includeOptions = withCustomers ? [
                {
                    model: db.Customer,
                    as: 'customers',
                    attributes: ['id', 'nama_customer', 'alamat']
                }
            ] : [];

            const { count, rows } = await db.Perusahaan.findAndCountAll({
                where: whereClause,
                include: includeOptions,
                limit,
                offset,
                order: [['nama_perusahaan', 'ASC']]
            });

            const totalPages = Math.ceil(count / limit);

            res.status(200).json({
                message: 'Data perusahaan berhasil diambil',
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
                message: 'Error mengambil data perusahaan',
                error: error.message
            });
        }
    }

    // Get perusahaan by ID
    public async getPerusahaanById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const withCustomers = req.query.withCustomers === 'true';

            if (!id || isNaN(parseInt(id))) {
                return res.status(400).json({ message: 'ID perusahaan tidak valid' });
            }

            const includeOptions = withCustomers ? [
                {
                    model: db.Customer,
                    as: 'customers',
                    attributes: ['id', 'nama_customer', 'alamat']
                }
            ] : [];

            const perusahaan = await db.Perusahaan.findByPk(id, {
                include: includeOptions
            });

            if (!perusahaan) {
                return res.status(404).json({ message: 'Perusahaan tidak ditemukan' });
            }

            res.status(200).json({
                message: 'Data perusahaan berhasil diambil',
                data: perusahaan
            });
        } catch (error: any) {
            res.status(500).json({
                message: 'Error mengambil data perusahaan',
                error: error.message
            });
        }
    }

    // Create new perusahaan
    public async createPerusahaan(req: Request, res: Response) {
        try {
            const { nama_perusahaan, alamat, no_telp, fax } = req.body;

            if (!nama_perusahaan) {
                return res.status(400).json({
                    message: 'Nama perusahaan wajib diisi'
                });
            }

            // Check if company name already exists
            const existing = await db.Perusahaan.findOne({
                where: { nama_perusahaan }
            });

            if (existing) {
                return res.status(400).json({
                    message: 'Nama perusahaan sudah ada'
                });
            }

            const perusahaan = await db.Perusahaan.create({
                nama_perusahaan,
                alamat: alamat || null,
                no_telp: no_telp || null,
                fax: fax || null
            });

            res.status(201).json({
                message: 'Perusahaan berhasil dibuat',
                data: perusahaan
            });
        } catch (error: any) {
            res.status(500).json({
                message: 'Error membuat perusahaan',
                error: error.message
            });
        }
    }

    // Update perusahaan
    public async updatePerusahaan(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { nama_perusahaan, alamat, no_telp, fax } = req.body;

            if (!id || isNaN(parseInt(id))) {
                return res.status(400).json({ message: 'ID perusahaan tidak valid' });
            }

            const perusahaan = await db.Perusahaan.findByPk(id);
            if (!perusahaan) {
                return res.status(404).json({ message: 'Perusahaan tidak ditemukan' });
            }

            // Check if new name already exists (except current company)
            if (nama_perusahaan && nama_perusahaan !== perusahaan.nama_perusahaan) {
                const existing = await db.Perusahaan.findOne({
                    where: {
                        nama_perusahaan,
                        id: { [Op.ne]: id }
                    }
                });

                if (existing) {
                    return res.status(400).json({
                        message: 'Nama perusahaan sudah ada'
                    });
                }
            }

            // Update fields
            const updateData: any = {};
            if (nama_perusahaan !== undefined) updateData.nama_perusahaan = nama_perusahaan;
            if (alamat !== undefined) updateData.alamat = alamat;
            if (no_telp !== undefined) updateData.no_telp = no_telp;
            if (fax !== undefined) updateData.fax = fax;

            await perusahaan.update(updateData);

            res.status(200).json({
                message: 'Perusahaan berhasil diupdate',
                data: perusahaan
            });
        } catch (error: any) {
            res.status(500).json({
                message: 'Error mengupdate perusahaan',
                error: error.message
            });
        }
    }

    // Delete perusahaan
    public async deletePerusahaan(req: Request, res: Response) {
        try {
            const { id } = req.params;

            if (!id || isNaN(parseInt(id))) {
                return res.status(400).json({ message: 'ID perusahaan tidak valid' });
            }

            const perusahaan = await db.Perusahaan.findByPk(id);
            if (!perusahaan) {
                return res.status(404).json({ message: 'Perusahaan tidak ditemukan' });
            }

            // Check if company has customers
            const hasCustomers = await db.Customer.findOne({
                where: { perusahaan_cust: id }
            });

            if (hasCustomers) {
                return res.status(400).json({
                    message: 'Perusahaan tidak dapat dihapus karena masih memiliki customer'
                });
            }

            // Check if company is used in faktur
            const isUsedInFaktur = await db.Faktur.findOne({
                where: { id_perusahaan: id }
            });

            if (isUsedInFaktur) {
                return res.status(400).json({
                    message: 'Perusahaan tidak dapat dihapus karena sudah digunakan dalam faktur'
                });
            }

            await perusahaan.destroy();

            res.status(200).json({
                message: 'Perusahaan berhasil dihapus'
            });
        } catch (error: any) {
            res.status(500).json({
                message: 'Error menghapus perusahaan',
                error: error.message
            });
        }
    }

    // Get perusahaan statistics
    public async getPerusahaanStats(req: Request, res: Response) {
        try {
            const totalPerusahaan = await db.Perusahaan.count();

            // Alternative approach: Get perusahaan with customer count using raw SQL
            const perusahaanWithCustomers = await sequelize.query(`
                SELECT 
                    p.id,
                    p.nama_perusahaan,
                    COUNT(c.id) as customer_count
                FROM perusahaan_raja p
                LEFT JOIN customer_raja c ON p.id = c.perusahaan_cust
                GROUP BY p.id, p.nama_perusahaan
                ORDER BY COUNT(c.id) DESC
                LIMIT 10
            `, {
                type: QueryTypes.SELECT
            });

            res.status(200).json({
                message: 'Statistik perusahaan berhasil diambil',
                data: {
                    total_perusahaan: totalPerusahaan,
                    top_perusahaan_by_customers: perusahaanWithCustomers
                }
            });
        } catch (error: any) {
            res.status(500).json({
                message: 'Error mengambil statistik perusahaan',
                error: error.message
            });
        }
    }
}

export default new PerusahaanController();
