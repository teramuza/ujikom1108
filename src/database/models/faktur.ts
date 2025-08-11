import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize, BelongsToGetAssociationMixin, HasManyGetAssociationsMixin, Association } from 'sequelize';

export class Faktur extends Model<InferAttributes<Faktur>, InferCreationAttributes<Faktur, { omit: 'id' }>> {
    declare id: CreationOptional<number>;
    declare no_faktur: string;
    declare due_date: Date;
    declare metode_bayar: 'Cash' | 'Transfer' | 'Credit Card' | 'Debit Card' | 'Tempo';
    declare ppn: number;
    declare dp: number;
    declare grand_total: number;
    declare user: number;
    declare id_customer: number;
    declare id_perusahaan?: number;

    // Association mixins
    declare getUser: BelongsToGetAssociationMixin<any>;
    declare getCustomer: BelongsToGetAssociationMixin<any>;
    declare getPerusahaan: BelongsToGetAssociationMixin<any>;
    declare getDetailFakturs: HasManyGetAssociationsMixin<any>;

    declare static associations: {
        user: Association<Faktur, any>;
        customer: Association<Faktur, any>;
        perusahaan: Association<Faktur, any>;
        detailFakturs: Association<Faktur, any>;
    };

    static associate(models: any) {
        Faktur.belongsTo(models.User, {
            foreignKey: 'user',
            as: 'userDetail'
        });

        Faktur.belongsTo(models.Customer, {
            foreignKey: 'id_customer',
            as: 'customer'
        });

        Faktur.belongsTo(models.Perusahaan, {
            foreignKey: 'id_perusahaan',
            as: 'perusahaan'
        });

        Faktur.hasMany(models.DetailFaktur, {
            foreignKey: 'no_faktur',
            sourceKey: 'no_faktur',
            as: 'detailFakturs'
        });
    }

    public getFakturData() {
        return this.toJSON();
    }

    // Method untuk generate nomor faktur otomatis
    public static async generateNoFaktur(): Promise<string> {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        const prefix = `INV-${year}${month}${day}`;

        // Cari faktur terakhir dengan prefix yang sama
        const lastFaktur = await Faktur.findOne({
            where: {
                no_faktur: {
                    [require('sequelize').Op.like]: `${prefix}%`
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
}

export default (sequelize: Sequelize): typeof Faktur => {
    Faktur.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        no_faktur: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        due_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        metode_bayar: {
            type: DataTypes.ENUM('Cash', 'Transfer', 'Credit Card', 'Debit Card', 'Tempo'),
            allowNull: false,
            defaultValue: 'Cash',
        },
        ppn: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0,
        },
        dp: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0,
        },
        grand_total: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        user: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users_raja',
                key: 'id'
            }
        },
        id_customer: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'customer_raja',
                key: 'id'
            }
        },
        id_perusahaan: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'perusahaan_raja',
                key: 'id'
            }
        },
    }, {
        sequelize,
        modelName: 'Faktur',
        tableName: 'faktur_raja',
        timestamps: true,
    });

    return Faktur;
}
