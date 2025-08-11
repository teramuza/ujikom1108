import express, {Express} from 'express';
import routers from './components';
import path from 'path';

const server: Express = express();
const port = process.env.PORT || process.env.APP_PORT;

server.use(express.json());
server.use(express.urlencoded({extended: true}));

import cors from 'cors';

server.use(cors());

server.use((req, res, next) => {
    res.set('Cache-Control', 'no-cache');
    next();
});

// Serve static files from public directory
server.use(express.static(path.join(__dirname, '../public')));

// Redirect root to login page
server.get('/', (req, res) => {
    res.redirect('/login.html');
});

server.use('/api/v1', routers);

server.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
