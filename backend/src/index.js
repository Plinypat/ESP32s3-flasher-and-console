import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import authRoutes from './routes/auth.js';
import deviceRoutes from './routes/devices.js';
import agentRoutes from './routes/agents.js';
import otaRoutes from './routes/ota.js';
import logRoutes from './routes/logs.js';
import { attachWebSocket } from './websocket/ws_server.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/devices', deviceRoutes);
app.use('/agents', agentRoutes);
app.use('/ota', otaRoutes);
app.use('/logs', logRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const server = http.createServer(app);
attachWebSocket(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Hive backend listening on port ${PORT}`);
});
