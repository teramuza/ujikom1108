import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize, HasManyGetAssociationsMixin, Association } from 'sequelize';

export class Produk extends Model<InferAttributes<Produk>, InferCreationAttributes<Produk, { omit: 'id' }>> {
    declare id: CreationOptional<number>;
    declare nama_produk: string;
    declare price: number;
    declare jenis?: string | null;
    declare stock?: number | null;

    // Association mixins
    declare getDetailFakturs: HasManyGetAssociationsMixin<any>;

    declare static associations: {
        detailFakturs: Association<Produk, any>;
    };

    static associate(models: any) {
        Produk.hasMany(models.DetailFaktur, {
            foreignKey: 'id_produk',
            as: 'detailFakturs'
        });
    }

    public getItemData() {
        return this.toJSON();
    }
}

export default (sequelize: Sequelize): typeof Produk => {
    Produk.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            nama_produk: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            price: {
                type: DataTypes.FLOAT,
                allowNull: false,
            },
            jenis: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            stock: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
        }, {
            sequelize,
            modelName: 'Produk',
            tableName: 'produk_raja',
            timestamps: true,
        },
    );
    return Produk;
}
