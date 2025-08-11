import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize, BelongsToGetAssociationMixin, Association } from 'sequelize';

export class DetailFaktur extends Model<InferAttributes<DetailFaktur>, InferCreationAttributes<DetailFaktur, { omit: 'id' | 'subtotal' }>> {
    declare id: CreationOptional<number>;
    declare id_produk: number;
    declare no_faktur: string;
    declare qty: number;
    declare price: number;
    declare subtotal: CreationOptional<number>;

    // Association mixins
    declare getProduk: BelongsToGetAssociationMixin<any>;
    declare getFaktur: BelongsToGetAssociationMixin<any>;

    declare static associations: {
        produk: Association<DetailFaktur, any>;
        faktur: Association<DetailFaktur, any>;
    };

    static associate(models: any) {
        DetailFaktur.belongsTo(models.Produk, {
            foreignKey: 'id_produk',
            as: 'produk'
        });

        DetailFaktur.belongsTo(models.Faktur, {
            foreignKey: 'no_faktur',
            targetKey: 'no_faktur',
            as: 'faktur'
        });
    }

    public getDetailData() {
        return this.toJSON();
    }

    // Method untuk kalkulasi subtotal otomatis
    public calculateSubtotal(): number {
        return this.qty * this.price;
    }
}

export default (sequelize: Sequelize): typeof DetailFaktur => {
    DetailFaktur.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        id_produk: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'produk_raja',
                key: 'id'
            }
        },
        no_faktur: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: 'faktur_raja',
                key: 'no_faktur'
            }
        },
        qty: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            validate: {
                min: 1
            }
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false,
            validate: {
                min: 0
            }
        },
        subtotal: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'DetailFaktur',
        tableName: 'detail_faktur_raja',
        timestamps: true,
        hooks: {
            beforeCreate: (detail: DetailFaktur) => {
                detail.subtotal = detail.calculateSubtotal();
            },
            beforeUpdate: (detail: DetailFaktur) => {
                detail.subtotal = detail.calculateSubtotal();
            }
        }
    });

    return DetailFaktur;
}
