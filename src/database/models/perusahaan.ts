import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize, HasManyGetAssociationsMixin, Association } from 'sequelize';

export class Perusahaan extends Model<InferAttributes<Perusahaan>, InferCreationAttributes<Perusahaan, { omit: 'id' }>> {
    declare id: CreationOptional<number>;
    declare nama_perusahaan: string;
    declare alamat?: string;
    declare no_telp?: string;
    declare fax?: string;

    declare getCustomers: HasManyGetAssociationsMixin<any>;

    declare static associations: {
        customers: Association<Perusahaan, any>;
    };

    static associate(models: any) {
        Perusahaan.hasMany(models.Customer, {
            foreignKey: 'perusahaan_cust',
            as: 'customers'
        });
    }

    public getPerusahaanData() {
        return this.toJSON();
    }
}

export default (sequelize: Sequelize): typeof Perusahaan => {
    Perusahaan.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nama_perusahaan: {
            type: DataTypes.STRING,
            allowNull: false
        },
        alamat: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        no_telp: {
            type: DataTypes.STRING,
            allowNull: true
        },
        fax: {
            type: DataTypes.STRING,
            allowNull: true
        },
    }, {
        sequelize,
        modelName: 'Perusahaan',
        tableName: 'perusahaan_raja',
        timestamps: true,
    });

    return Perusahaan;
}
