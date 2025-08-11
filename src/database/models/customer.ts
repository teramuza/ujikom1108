import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize, BelongsToGetAssociationMixin, Association } from 'sequelize';

export class Customer extends Model<InferAttributes<Customer>, InferCreationAttributes<Customer, { omit: 'id' }>> {
    declare id: CreationOptional<number>;
    declare nama_customer: string;
    declare perusahaan_cust?: number | null;
    declare alamat?: string;

    // Association mixins
    declare getPerusahaan: BelongsToGetAssociationMixin<any>;

    declare static associations: {
        perusahaan: Association<Customer, any>;
    };

    static associate(models: any) {
        Customer.belongsTo(models.Perusahaan, {
            foreignKey: 'perusahaan_cust',
            as: 'perusahaan'
        });
    }

    public getCustomerData() {
        return this.toJSON();
    }
}

export default (sequelize: Sequelize): typeof Customer => {
    Customer.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nama_customer: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        perusahaan_cust: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'perusahaan_raja',
                key: 'id'
            }
        },
        alamat: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    }, {
        sequelize,
        modelName: 'Customer',
        tableName: 'customer_raja',
        timestamps: true,
    });

    return Customer;
}
