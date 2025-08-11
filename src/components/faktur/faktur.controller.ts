import { Request, Response } from 'express';
import db, { sequelize } from '@model';
import BaseController from '@lib/base/BaseController';
import { Op, QueryTypes } from 'sequelize';

class FakturController extends BaseController {

    // Get all fakturs with relations
    public async getAllFaktur(req: Request, res: Response) {
        try {
            const { page = 1, limit = 10, search } = req.query;
            const offset = (Number(page) - 1) * Number(limit);

            let whereClause: any = {};
            if (search) {
                whereClause = {
                    [Op.or]: [
                        { no_faktur: { [Op.like]: `%${search}%` } },
                        { metode_bayar: { [Op.like]: `%${search}%` } }
                    ]
                };
            }

            const { count, rows } = await db.Faktur.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: db.Customer,
                        as: 'customer',
                        attributes: ['id', 'nama_customer', 'alamat']
                    },
                    {
                        model: db.Perusahaan,
                        as: 'perusahaan',
                        attributes: ['id', 'nama_perusahaan'],
                        required: false
                    },
                    {
                        model: db.User,
                        as: 'userDetail',
                        attributes: ['id', 'name', 'username']
                    },
                    {
                        model: db.DetailFaktur,
                        as: 'detailFakturs',
                        include: [
                            {
                                model: db.Produk,
                                as: 'produk',
                                attributes: ['id', 'nama_produk', 'price', 'stock']
                            }
                        ]
                    }
                ],
                order: [['createdAt', 'DESC']],
                limit: Number(limit),
                offset: offset
            });

            res.status(200).json({
                message: 'Daftar faktur berhasil diambil',
                data: rows,
                pagination: {
                    current_page: Number(page),
                    per_page: Number(limit),
                    total: count,
                    total_pages: Math.ceil(count / Number(limit))
                }
            });
        } catch (error: any) {
            res.status(500).json({
                message: 'Error mengambil data faktur',
                error: error.message
            });
        }
    }

    // Get faktur by ID
    public async getFakturById(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const faktur = await db.Faktur.findByPk(id, {
                include: [
                    {
                        model: db.Customer,
                        as: 'customer',
                        include: [
                            {
                                model: db.Perusahaan,
                                as: 'perusahaan',
                                required: false
                            }
                        ]
                    },
                    {
                        model: db.Perusahaan,
                        as: 'perusahaan',
                        required: false
                    },
                    {
                        model: db.User,
                        as: 'userDetail',
                        attributes: ['id', 'name', 'username']
                    },
                    {
                        model: db.DetailFaktur,
                        as: 'detailFakturs',
                        include: [
                            {
                                model: db.Produk,
                                as: 'produk',
                                attributes: ['id', 'nama_produk', 'price', 'stock']
                            }
                        ]
                    }
                ]
            });

            if (!faktur) {
                return res.status(404).json({
                    message: 'Faktur tidak ditemukan'
                });
            }

            res.status(200).json({
                message: 'Detail faktur berhasil diambil',
                data: faktur
            });
        } catch (error: any) {
            res.status(500).json({
                message: 'Error mengambil detail faktur',
                error: error.message
            });
        }
    }

    // Generate nomor faktur otomatis
    public async generateNoFaktur(): Promise<string> {
        console.log('generateNoFaktur method called'); // Debug log
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        const prefix = `INV-${year}${month}${day}`;

        // Cari faktur terakhir dengan prefix yang sama
        const lastFaktur = await db.Faktur.findOne({
            where: {
                no_faktur: {
                    [Op.like]: `${prefix}%`
                }
            },
            order: [['no_faktur', 'DESC']]
        });

        let sequence = 1;
        if (lastFaktur) {
            const lastSequence = lastFaktur.no_faktur.split('-').pop();
            sequence = parseInt(lastSequence || '0') + 1;
        }

        return `${prefix}-${String(sequence).padStart(4, '0')}`;
    }

    // Create new faktur
    public async createFaktur(req: Request, res: Response) {
        const transaction = await sequelize.transaction();

        try {
            const {
                due_date,
                metode_bayar,
                ppn = 0,
                dp = 0,
                id_customer,
                id_perusahaan,
                detailItems = []
            } = req.body;

            // Validation
            if (!due_date || !metode_bayar || !id_customer) {
                await transaction.rollback();
                return res.status(400).json({
                    message: 'Field wajib: due_date, metode_bayar, id_customer'
                });
            }

            // Verify customer exists
            const customer = await db.Customer.findByPk(id_customer);
            if (!customer) {
                await transaction.rollback();
                return res.status(404).json({
                    message: 'Customer tidak ditemukan'
                });
            }

            // Verify perusahaan if provided
            if (id_perusahaan) {
                const perusahaan = await db.Perusahaan.findByPk(id_perusahaan);
                if (!perusahaan) {
                    await transaction.rollback();
                    return res.status(404).json({
                        message: 'Perusahaan tidak ditemukan'
                    });
                }
            }

            // Generate nomor faktur
            console.log('About to call generateNoFaktur, this:', typeof this); // Debug log
            const no_faktur = await this.generateNoFaktur();

            // Calculate grand total from detail items
            let subtotal = 0;
            if (detailItems && detailItems.length > 0) {
                for (const item of detailItems) {
                    if (!item.id_produk || !item.qty || !item.price) {
                        await transaction.rollback();
                        return res.status(400).json({
                            message: 'Detail item harus memiliki id_produk, qty, dan price'
                        });
                    }

                    // Verify produk exists and check stock
                    const produk = await db.Produk.findByPk(item.id_produk);
                    if (!produk) {
                        await transaction.rollback();
                        return res.status(404).json({
                            message: `Produk dengan ID ${item.id_produk} tidak ditemukan`
                        });
                    }

                    if (produk?.stock && produk?.stock < item.qty) {
                        await transaction.rollback();
                        return res.status(400).json({
                            message: `Stock produk ${produk.nama_produk} tidak mencukupi. Stock tersedia: ${produk.stock}`
                        });
                    }

                    subtotal += item.qty * item.price;
                }
            }

            const ppnAmount = (subtotal * ppn) / 100;
            const grand_total = subtotal + ppnAmount - dp;

            // Get user from request (assuming auth middleware sets req.user)
            // Get user from auth middleware or create/find default user
            let user = (req as any).user?.id;
            
            if (!user) {
                // Find any existing user as fallback
                const defaultUser = await db.User.findOne();
                if (defaultUser) {
                    user = defaultUser.id;
                } else {
                    // Create default user if none exists
                    const newUser = await db.User.create({
                        name: 'Default User',
                        username: 'admin',
                        pass: 'admin123' // This should be hashed in production
                    });
                    user = newUser.id;
                }
            }

            // Create faktur
            const faktur = await db.Faktur.create({
                no_faktur,
                due_date,
                metode_bayar,
                ppn,
                dp,
                grand_total,
                user,
                id_customer,
                id_perusahaan: id_perusahaan || null
            }, { transaction });

            // Create detail faktur and update stock
            const createdDetails = [];
            if (detailItems && detailItems.length > 0) {
                for (const item of detailItems) {
                    const detail = await db.DetailFaktur.create({
                        id_produk: item.id_produk,
                        no_faktur: faktur.no_faktur,
                        qty: item.qty,
                        price: item.price,
                        subtotal: item.qty * item.price
                    }, { transaction });

                    createdDetails.push(detail);

                    // Update stock produk
                    await db.Produk.update(
                        { stock: sequelize.literal(`stock - ${item.qty}`) },
                        {
                            where: { id: item.id_produk },
                            transaction
                        }
                    );
                }
            }

            await transaction.commit();

            // Return created faktur with relations
            const createdFaktur = await db.Faktur.findByPk(faktur.id, {
                include: [
                    {
                        model: db.Customer,
                        as: 'customer'
                    },
                    {
                        model: db.Perusahaan,
                        as: 'perusahaan',
                        required: false
                    },
                    {
                        model: db.DetailFaktur,
                        as: 'detailFakturs',
                        include: [
                            {
                                model: db.Produk,
                                as: 'produk',
                                attributes: ['id', 'nama_produk', 'price', 'stock']
                            }
                        ]
                    }
                ]
            });

            res.status(201).json({
                message: 'Faktur berhasil dibuat',
                data: createdFaktur
            });

        } catch (error: any) {
            await transaction.rollback();
            res.status(500).json({
                message: 'Error membuat faktur',
                error: error.message
            });
        }
    }

    // Update faktur
    public async updateFaktur(req: Request, res: Response) {
        const transaction = await sequelize.transaction();

        try {
            const { id } = req.params;
            const {
                due_date,
                metode_bayar,
                ppn,
                dp,
                id_customer,
                id_perusahaan,
                detailItems = []
            } = req.body;

            const faktur = await db.Faktur.findByPk(id);
            if (!faktur) {
                await transaction.rollback();
                return res.status(404).json({
                    message: 'Faktur tidak ditemukan'
                });
            }

            // Restore stock from existing detail items
            const existingDetails = await db.DetailFaktur.findAll({
                where: { no_faktur: faktur.no_faktur }
            });

            for (const detail of existingDetails) {
                await db.Produk.update(
                    { stock: sequelize.literal(`stock + ${detail.qty}`) },
                    {
                        where: { id: detail.id_produk },
                        transaction
                    }
                );
            }

            // Delete existing detail items
            await db.DetailFaktur.destroy({
                where: { no_faktur: faktur.no_faktur },
                transaction
            });

            // Calculate new grand total
            let subtotal = 0;
            for (const item of detailItems) {
                const produk = await db.Produk.findByPk(item.id_produk);
                if (!produk) {
                    await transaction.rollback();
                    return res.status(404).json({
                        message: `Produk dengan ID ${item.id_produk} tidak ditemukan`
                    });
                }

                if (produk?.stock && produk.stock < item.qty) {
                    await transaction.rollback();
                    return res.status(400).json({
                        message: `Stock produk ${produk.nama_produk} tidak mencukupi. Stock tersedia: ${produk.stock}`
                    });
                }

                subtotal += item.qty * item.price;
            }

            const ppnAmount = (subtotal * (ppn || 0)) / 100;
            const grand_total = subtotal + ppnAmount - (dp || 0);

            // Update faktur
            await faktur.update({
                due_date: due_date || faktur.due_date,
                metode_bayar: metode_bayar || faktur.metode_bayar,
                ppn: ppn !== undefined ? ppn : faktur.ppn,
                dp: dp !== undefined ? dp : faktur.dp,
                grand_total,
                id_customer: id_customer || faktur.id_customer,
                id_perusahaan: id_perusahaan !== undefined ? id_perusahaan : faktur.id_perusahaan
            }, { transaction });

            // Create new detail items and update stock
            for (const item of detailItems) {
                await db.DetailFaktur.create({
                    id_produk: item.id_produk,
                    no_faktur: faktur.no_faktur,
                    qty: item.qty,
                    price: item.price,
                    subtotal: item.qty * item.price
                }, { transaction });

                await db.Produk.update(
                    { stock: sequelize.literal(`stock - ${item.qty}`) },
                    {
                        where: { id: item.id_produk },
                        transaction
                    }
                );
            }

            await transaction.commit();

            // Return updated faktur
            const updatedFaktur = await db.Faktur.findByPk(id, {
                include: [
                    {
                        model: db.Customer,
                        as: 'customer'
                    },
                    {
                        model: db.Perusahaan,
                        as: 'perusahaan',
                        required: false
                    },
                    {
                        model: db.DetailFaktur,
                        as: 'detailFakturs',
                        include: [
                            {
                                model: db.Produk,
                                as: 'produk',
                                attributes: ['id', 'nama_produk', 'price', 'stock']
                            }
                        ]
                    }
                ]
            });

            res.status(200).json({
                message: 'Faktur berhasil diupdate',
                data: updatedFaktur
            });

        } catch (error: any) {
            await transaction.rollback();
            res.status(500).json({
                message: 'Error mengupdate faktur',
                error: error.message
            });
        }
    }

    // Delete faktur
    public async deleteFaktur(req: Request, res: Response) {
        const transaction = await sequelize.transaction();

        try {
            const { id } = req.params;

            const faktur = await db.Faktur.findByPk(id);
            if (!faktur) {
                await transaction.rollback();
                return res.status(404).json({
                    message: 'Faktur tidak ditemukan'
                });
            }

            // Restore stock from detail items
            const detailItems = await db.DetailFaktur.findAll({
                where: { no_faktur: faktur.no_faktur }
            });

            for (const detail of detailItems) {
                await db.Produk.update(
                    { stock: sequelize.literal(`stock + ${detail.qty}`) },
                    {
                        where: { id: detail.id_produk },
                        transaction
                    }
                );
            }

            // Delete detail items first
            await db.DetailFaktur.destroy({
                where: { no_faktur: faktur.no_faktur },
                transaction
            });

            // Delete faktur
            await faktur.destroy({ transaction });

            await transaction.commit();

            res.status(200).json({
                message: 'Faktur berhasil dihapus'
            });

        } catch (error: any) {
            await transaction.rollback();
            res.status(500).json({
                message: 'Error menghapus faktur',
                error: error.message
            });
        }
    }

    // Get faktur statistics
    public async getFakturStats(req: Request, res: Response) {
        try {
            const totalFaktur = await db.Faktur.count();

            const thisMonth = new Date();
            thisMonth.setDate(1);
            thisMonth.setHours(0, 0, 0, 0);

            const nextMonth = new Date(thisMonth);
            nextMonth.setMonth(nextMonth.getMonth() + 1);

            const fakturThisMonth: number = await db.Faktur.count({
                where: sequelize.where(
                    sequelize.col('createdAt'),
                    {
                        [Op.gte]: thisMonth,
                        [Op.lt]: nextMonth
                    }
                )
            });

            const totalRevenue = await db.Faktur.sum('grand_total') || 0;

            const revenueThisMonth: number = await db.Faktur.sum('grand_total', {
                where: sequelize.where(
                    sequelize.col('createdAt'),
                    {
                        [Op.gte]: thisMonth,
                        [Op.lt]: nextMonth
                    }
                )
            }) || 0;

            // Top products this month
            const topProducts = await sequelize.query(`
                SELECT 
                    p.nama_produk,
                    SUM(df.qty) as total_qty,
                    SUM(df.subtotal) as total_revenue
                FROM detail_faktur_raja df
                JOIN produk_raja p ON df.id_produk = p.id
                JOIN faktur_raja f ON df.no_faktur = f.no_faktur
                WHERE f.createdAt >= :thisMonth AND f.createdAt < :nextMonth
                GROUP BY df.id_produk, p.nama_produk
                ORDER BY total_qty DESC
                LIMIT 5
            `, {
                replacements: { thisMonth, nextMonth },
                type: QueryTypes.SELECT
            });

            res.status(200).json({
                message: 'Statistik faktur berhasil diambil',
                data: {
                    total_faktur: totalFaktur,
                    faktur_this_month: fakturThisMonth,
                    total_revenue: totalRevenue,
                    revenue_this_month: revenueThisMonth,
                    top_products: topProducts
                }
            });

        } catch (error: any) {
            res.status(500).json({
                message: 'Error mengambil statistik faktur',
                error: error.message
            });
        }
    }

    // Update detail items for existing faktur
    public async updateDetailFaktur(req: Request, res: Response) {
        const transaction = await sequelize.transaction();
        
        try {
            const { id } = req.params; // faktur ID
            const { detailItems = [] } = req.body;

            // Find the faktur
            const faktur = await db.Faktur.findByPk(id);
            if (!faktur) {
                await transaction.rollback();
                return res.status(404).json({
                    message: 'Faktur tidak ditemukan'
                });
            }

            // Get existing detail items to restore stock
            const existingDetails = await db.DetailFaktur.findAll({
                where: { no_faktur: faktur.no_faktur }
            });

            // Restore stock from existing detail items
            for (const detail of existingDetails) {
                await db.Produk.update(
                    { stock: sequelize.literal(`stock + ${detail.qty}`) },
                    {
                        where: { id: detail.id_produk },
                        transaction
                    }
                );
            }

            // Delete existing detail items
            await db.DetailFaktur.destroy({
                where: { no_faktur: faktur.no_faktur },
                transaction
            });

            // Validate and create new detail items
            let subtotal = 0;
            for (const item of detailItems) {
                if (!item.id_produk || !item.qty || !item.price) {
                    await transaction.rollback();
                    return res.status(400).json({
                        message: 'Detail item harus memiliki id_produk, qty, dan price'
                    });
                }

                // Verify produk exists and check stock
                const produk = await db.Produk.findByPk(item.id_produk);
                if (!produk) {
                    await transaction.rollback();
                    return res.status(404).json({
                        message: `Produk dengan ID ${item.id_produk} tidak ditemukan`
                    });
                }

                if (produk?.stock && produk.stock < item.qty) {
                    await transaction.rollback();
                    return res.status(400).json({
                        message: `Stock produk ${produk.nama_produk} tidak mencukupi. Stock tersedia: ${produk.stock}`
                    });
                }

                // Create new detail item
                await db.DetailFaktur.create({
                    id_produk: item.id_produk,
                    no_faktur: faktur.no_faktur,
                    qty: item.qty,
                    price: item.price,
                    subtotal: item.qty * item.price
                }, { transaction });

                // Update stock
                await db.Produk.update(
                    { stock: sequelize.literal(`stock - ${item.qty}`) },
                    {
                        where: { id: item.id_produk },
                        transaction
                    }
                );

                subtotal += item.qty * item.price;
            }

            // Recalculate grand total
            const ppnAmount = (subtotal * (faktur.ppn || 0)) / 100;
            const grand_total = subtotal + ppnAmount - (faktur.dp || 0);

            // Update faktur grand total
            await faktur.update({ grand_total }, { transaction });

            await transaction.commit();

            // Return updated faktur with detail items
            const updatedFaktur = await db.Faktur.findByPk(id, {
                include: [
                    {
                        model: db.Customer,
                        as: 'customer',
                        include: [
                            {
                                model: db.Perusahaan,
                                as: 'perusahaan',
                                required: false
                            }
                        ]
                    },
                    {
                        model: db.Perusahaan,
                        as: 'perusahaan',
                        required: false
                    },
                    {
                        model: db.User,
                        as: 'userDetail',
                        attributes: ['id', 'name', 'username']
                    },
                    {
                        model: db.DetailFaktur,
                        as: 'detailFakturs',
                        include: [
                            {
                                model: db.Produk,
                                as: 'produk',
                                attributes: ['id', 'nama_produk', 'price', 'stock']
                            }
                        ]
                    }
                ]
            });

            res.status(200).json({
                message: 'Detail faktur berhasil diupdate',
                data: updatedFaktur
            });

        } catch (error: any) {
            await transaction.rollback();
            res.status(500).json({
                message: 'Error mengupdate detail faktur',
                error: error.message
            });
        }
    }

    // Get detail items for a specific faktur
    public async getDetailFaktur(req: Request, res: Response) {
        try {
            const { id } = req.params; // faktur ID

            const faktur = await db.Faktur.findByPk(id);
            if (!faktur) {
                return res.status(404).json({
                    message: 'Faktur tidak ditemukan'
                });
            }

            const detailItems = await db.DetailFaktur.findAll({
                where: { no_faktur: faktur.no_faktur },
                include: [
                    {
                        model: db.Produk,
                        as: 'produk',
                        attributes: ['id', 'nama_produk', 'price', 'stock']
                    }
                ],
                order: [['createdAt', 'ASC']]
            });

            res.status(200).json({
                message: 'Detail faktur berhasil diambil',
                data: detailItems
            });

        } catch (error: any) {
            res.status(500).json({
                message: 'Error mengambil detail faktur',
                error: error.message
            });
        }
    }
}

const fakturController = new FakturController();
export default fakturController;
