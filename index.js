import { createBareServer } from '@tomphttp/bare-server-node'; // ← ここに { } を付けました
import http from 'node:http';
import express from 'express';
import { uvPath } from '@titaniumnetwork-dev/ultraviolet';
import { join } from 'node:path';

const bare = createBareServer('/bare/');
const app = express();

// 静的ファイル（HTMLなど）を public フォルダから配信
app.use(express.static(join(process.cwd(), 'public')));

// Ultravioletのコアファイルをルートに紐付け
app.use('/uv/', express.static(uvPath));

const server = http.createServer();

server.on('request', (req, res) => {
    if (bare.shouldRoute(req)) {
        bare.route(req, res);
    } else {
        app(req, res);
    }
});

server.on('upgrade', (req, socket, head) => {
    if (bare.shouldRoute(req)) {
        bare.routeUpgrade(req, socket, head);
    } else {
        socket.end();
    }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});