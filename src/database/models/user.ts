import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize, HasManyGetAssociationsMixin, Association } from 'sequelize';

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User, { omit: 'id' }>> {
    declare id: CreationOptional<number>;
    declare name: string;
    declare username: string;
    declare pass: string;

    // Association mixins
    declare getFakturs: HasManyGetAssociationsMixin<any>;

    declare static associations: {
        fakturs: Association<User, any>;
    };

    static associate(models: any) {
        User.hasMany(models.Faktur, {
            foreignKey: 'user',
            as: 'fakturs'
        });
    }

    public getUserData() {
        return this.toJSON();
    }
}

export default (sequelize: Sequelize): typeof User => {
    User.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        pass: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'User',
        tableName: 'users_raja',
        timestamps: true,
    });

    return User;
}
