import { Request, Response } from 'express';
import db from '@model';
import BaseController from '@lib/base/BaseController';
import { Op } from 'sequelize';

class ProdukController extends BaseController {

    // Get all products with pagination and search
    public async getAllProduk(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string;
            const jenis = req.query.jenis as string;

            const offset = (page - 1) * limit;

            const whereClause: any = {};

            if (search) {
                whereClause.nama_produk = {
                    [Op.iLike]: `%${search}%`
                };
            }

            if (jenis) {
                whereClause.jenis = jenis;
            }

            const { count, rows } = await db.Produk.findAndCountAll({
                where: whereClause,
                limit,
                offset,
                order: [['nama_produk', 'ASC']]
            });

            const totalPages = Math.ceil(count / limit);

            res.status(200).json({
                message: 'Data produk berhasil diambil',
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
                message: 'Error mengambil data produk',
                error: error.message
            });
        }
    }

    // Get product by ID
    public async getProdukById(req: Request, res: Response) {
        try {
            const { id } = req.params;

            if (!id || isNaN(parseInt(id))) {
                return res.status(400).json({ message: 'ID produk tidak valid' });
            }

            const produk = await db.Produk.findByPk(id);

            if (!produk) {
                return res.status(404).json({ message: 'Produk tidak ditemukan' });
            }

            res.status(200).json({
                message: 'Data produk berhasil diambil',
                data: produk
            });
        } catch (error: any) {
            res.status(500).json({
                message: 'Error mengambil data produk',
                error: error.message
            });
        }
    }

    // Create new product
    public async createProduk(req: Request, res: Response) {
        try {
            const { nama_produk, price, jenis, stock } = req.body;

            if (!nama_produk || !price) {
                return res.status(400).json({
                    message: 'Nama produk dan harga wajib diisi'
                });
            }

            if (price < 0) {
                return res.status(400).json({
                    message: 'Harga tidak boleh negatif'
                });
            }

            if (stock && stock < 0) {
                return res.status(400).json({
                    message: 'Stock tidak boleh negatif'
                });
            }

            // Check if product name already exists
            const existing = await db.Produk.findOne({
                where: { nama_produk }
            });

            if (existing) {
                return res.status(400).json({
                    message: 'Nama produk sudah ada'
                });
            }

            const produk = await db.Produk.create({
                nama_produk,
                price: parseFloat(price),
                jenis: jenis || null,
                stock: stock ? parseInt(stock) : null
            });

            res.status(201).json({
                message: 'Produk berhasil dibuat',
                data: produk
            });
        } catch (error: any) {
            res.status(500).json({
                message: 'Error membuat produk',
                error: error.message
            });
        }
    }

    // Update product
    public async updateProduk(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { nama_produk, price, jenis, stock } = req.body;

            if (!id || isNaN(parseInt(id))) {
                return res.status(400).json({ message: 'ID produk tidak valid' });
            }

            const produk = await db.Produk.findByPk(id);
            if (!produk) {
                return res.status(404).json({ message: 'Produk tidak ditemukan' });
            }

            // Validation
            if (price !== undefined && price < 0) {
                return res.status(400).json({
                    message: 'Harga tidak boleh negatif'
                });
            }

            if (stock !== undefined && stock < 0) {
                return res.status(400).json({
                    message: 'Stock tidak boleh negatif'
                });
            }

            // Check if new name already exists (except current product)
            if (nama_produk && nama_produk !== produk.nama_produk) {
                const existing = await db.Produk.findOne({
                    where: {
                        nama_produk,
                        id: { [Op.ne]: id }
                    }
                });

                if (existing) {
                    return res.status(400).json({
                        message: 'Nama produk sudah ada'
                    });
                }
            }

            // Update fields
            const updateData: any = {};
            if (nama_produk !== undefined) updateData.nama_produk = nama_produk;
            if (price !== undefined) updateData.price = parseFloat(price);
            if (jenis !== undefined) updateData.jenis = jenis;
            if (stock !== undefined) updateData.stock = parseInt(stock);

            await produk.update(updateData);

            res.status(200).json({
                message: 'Produk berhasil diupdate',
                data: produk
            });
        } catch (error: any) {
            res.status(500).json({
                message: 'Error mengupdate produk',
                error: error.message
            });
        }
    }

    // Delete product
    public async deleteProduk(req: Request, res: Response) {
        try {
            const { id } = req.params;

            if (!id || isNaN(parseInt(id))) {
                return res.status(400).json({ message: 'ID produk tidak valid' });
            }

            const produk = await db.Produk.findByPk(id);
            if (!produk) {
                return res.status(404).json({ message: 'Produk tidak ditemukan' });
            }

            // Check if product is used in any detail faktur
            const isUsed = await db.DetailFaktur.findOne({
                where: { id_produk: id }
            });

            if (isUsed) {
                return res.status(400).json({
                    message: 'Produk tidak dapat dihapus karena sudah digunakan dalam faktur'
                });
            }

            await produk.destroy();

            res.status(200).json({
                message: 'Produk berhasil dihapus'
            });
        } catch (error: any) {
            res.status(500).json({
                message: 'Error menghapus produk',
                error: error.message
            });
        }
    }

    // Get products with low stock
    public async getLowStockProduk(req: Request, res: Response) {
        try {
            const threshold = parseInt(req.query.threshold as string) || 10;

            const produk = await db.Produk.findAll({
                where: {
                    stock: {
                        [Op.lte]: threshold,
                        [Op.ne]: null
                    }
                },
                order: [['stock', 'ASC']]
            });

            res.status(200).json({
                message: 'Data produk dengan stok rendah berhasil diambil',
                data: produk,
                threshold
            });
        } catch (error: any) {
            res.status(500).json({
                message: 'Error mengambil data produk stok rendah',
                error: error.message
            });
        }
    }

    // Get product categories/jenis
    public async getJenisProduk(req: Request, res: Response) {
        try {
            const jenisList = await db.Produk.findAll({
                attributes: ['jenis'],
                group: ['jenis'],
                where: {
                    jenis: {
                        [Op.ne]: null
                    }
                },
                raw: true
            });

            const categories = jenisList.map((item: any) => item.jenis).filter(Boolean);

            res.status(200).json({
                message: 'Data kategori produk berhasil diambil',
                data: categories
            });
        } catch (error: any) {
            res.status(500).json({
                message: 'Error mengambil kategori produk',
                error: error.message
            });
        }
    }

    // Update stock
    public async updateStock(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { stock, operation } = req.body; // operation: 'add', 'subtract', 'set'

            if (!id || isNaN(parseInt(id))) {
                return res.status(400).json({ message: 'ID produk tidak valid' });
            }

            if (!stock || isNaN(parseInt(stock))) {
                return res.status(400).json({ message: 'Jumlah stock tidak valid' });
            }

            if (!operation || !['add', 'subtract', 'set'].includes(operation)) {
                return res.status(400).json({
                    message: 'Operation harus berisi: add, subtract, atau set'
                });
            }

            const produk = await db.Produk.findByPk(id);
            if (!produk) {
                return res.status(404).json({ message: 'Produk tidak ditemukan' });
            }

            let newStock: number;
            const stockValue = parseInt(stock);
            const currentStock = produk.stock || 0;

            switch (operation) {
                case 'add':
                    newStock = currentStock + stockValue;
                    break;
                case 'subtract':
                    newStock = currentStock - stockValue;
                    if (newStock < 0) {
                        return res.status(400).json({
                            message: 'Stock tidak boleh negatif'
                        });
                    }
                    break;
                case 'set':
                    newStock = stockValue;
                    break;
                default:
                    newStock = currentStock;
            }

            await produk.update({ stock: newStock });

            res.status(200).json({
                message: `Stock berhasil ${operation === 'add' ? 'ditambah' : operation === 'subtract' ? 'dikurangi' : 'diubah'}`,
                data: {
                    id: produk.id,
                    nama_produk: produk.nama_produk,
                    previous_stock: currentStock,
                    new_stock: newStock,
                    operation,
                    amount: stockValue
                }
            });
        } catch (error: any) {
            res.status(500).json({
                message: 'Error mengupdate stock',
                error: error.message
            });
        }
    }
}

export default new ProdukController();
