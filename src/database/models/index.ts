import { Sequelize } from 'sequelize';
import sequelizeConfig from '../../config/sequelize.config';
import User from './user';
import Produk from './produk';
import Perusahaan from './perusahaan';
import Customer from './customer';
import Faktur from './faktur';
import DetailFaktur from './detailFaktur';

const sequelize = sequelizeConfig.use_env_variable
    ? new Sequelize(
        process.env[sequelizeConfig.use_env_variable] as string,
        sequelizeConfig,
    )
    : new Sequelize(
        sequelizeConfig.database as string,
        sequelizeConfig.username as string,
        sequelizeConfig.password as string,
        sequelizeConfig,
    );

const models = {
    User: User(sequelize),
    Produk: Produk(sequelize),
    Perusahaan: Perusahaan(sequelize),
    Customer: Customer(sequelize),
    Faktur: Faktur(sequelize),
    DetailFaktur: DetailFaktur(sequelize),
};

Object.values(models).forEach((model) => {
    if ('associate' in model) {
        model.associate(models);
    }
});

export { sequelize };
export default models;
