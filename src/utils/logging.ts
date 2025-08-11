require('dotenv').config();
const logging = process.env.DEV_MODE !== 'false';

const error = (...data: any[]) => logging && console.error(...data);

const info = (...data: any[]) => logging && console.log(...data);

const warn = (...data: any[]) => logging && console.warn(...data);

export default {
    error,
    warn,
    info,
};
