"use strict";

var _http = _interopRequireDefault(require("http"));
var _app = require("./app");
var _env = require("./config/env");
var _logger = require("./config/logger");
var _database = require("./config/database");
var _server = require("./websocket/server");
var _militrackService = require("./modules/militrack/militrack.service");

function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }

const app = (0, _app.createApp)();
const server = _http.default.createServer(app);

// Ingestion Worker
const startIngestionWorker = () => {
  const service = new _militrackService.MilitrackService();
  const interval = Number(process.env.MILITRACK_POLL_INTERVAL) || 15000;

  _logger.logger.info('Starting Militrack Ingestion Worker', { interval });

  const run = async () => {
    try {
      const devices = await service.listDevices({});
      if (devices.length > 0) {
        await service.syncDevicesToDb(devices);
        _logger.logger.info(`Ingested ${devices.length} devices from Militrack`);

        // Emit update via WebSocket
        const io = (0, _server.getIo)();
        if (io) {
            io.emit('vehicle:update', devices);
        }
      }
    } catch (err) {
      _logger.logger.error('Ingestion failed', { err: err instanceof Error ? err.message : err });
    } finally {
      setTimeout(run, interval);
    }
  };

  run();
};

server.on('error', err => {
  if (err?.code === 'EADDRINUSE') {
    _logger.logger.error('Port already in use', {
      port: _env.env.server.port
    });
    process.exit(1);
  }
  _logger.logger.error('Server failed to start', {
    err
  });
  process.exit(1);
});

async function start() {
  server.listen(_env.env.server.port, () => {
    _logger.logger.info('Server started', {
      port: _env.env.server.port
    });
    try {
      (0, _server.initWebSocket)(server);
      _logger.logger.info('WebSocket initialized');
    } catch (err) {
      _logger.logger.error('WebSocket failed to initialize (continuing without realtime)', {
        err
      });
    }

    // Start Ingestion
    startIngestionWorker();
  });

  const tryConnect = async () => {
    try {
      await _database.prisma.$connect();
      _logger.logger.info('Database connected');
    } catch (err) {
      _logger.logger.error('Database unavailable, retrying', {
        err
      });
      setTimeout(() => {
        void tryConnect();
      }, 10_000);
    }
  };
  void tryConnect();
}
void start();
