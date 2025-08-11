import { Dialect } from 'sequelize/types/sequelize';

require('dotenv').config();

interface Config {
    username: string;
    password: string;
    database: string;
    host: string;
    dialect: Dialect;
    use_env_variable?: string;
    logging?: boolean;
    dialectOptions?: {
        ssl?: {
            require: boolean;
            rejectUnauthorized: boolean;
        };
    };
}

const config: Config = {
    username: process.env.DB_USERNAME as string,
    password: process.env.DB_PASSWORD as string,
    database: process.env.DB_DATABASE as string,
    host: process.env.DB_HOST as string,
    dialect: process.env.DB_DIALECT as Dialect,
};

if (process.env.DEV_MODE === 'false') {
    config.use_env_variable = 'DATABASE_URL';
    config.logging = false;
    config.dialectOptions = {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    };
}

export default config;
