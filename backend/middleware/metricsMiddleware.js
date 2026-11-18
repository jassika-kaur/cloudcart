const client = require('prom-client');

// Create a Registry which registers the metrics
const register = new client.Registry();

// Add default metrics (memory, cpu, gc, etc.)
client.collectDefaultMetrics({
  app: 'cloudcart-backend',
  prefix: 'cloudcart_',
  timeout: 5000,
  register
});

// Custom HTTP request counter
const httpRequestCounter = new client.Counter({
  name: 'cloudcart_http_requests_total',
  help: 'Total number of HTTP requests processed by CloudCart backend',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

// Custom HTTP request duration histogram
const httpRequestDuration = new client.Histogram({
  name: 'cloudcart_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.2, 0.5, 1, 2, 5],
  registers: [register]
});

// Middleware to measure request metrics
const metricsMiddleware = (req, res, next) => {
  // Do not track metrics endpoint itself to prevent skew
  if (req.path === '/metrics') {
    return next();
  }

  const start = process.hrtime();

  res.on('finish', () => {
    const elapsed = process.hrtime(start);
    const durationInSeconds = elapsed[0] + elapsed[1] / 1e9;

    // Normalize route label to prevent high-cardinality explosions (e.g. /api/products/:id)
    const route = req.baseUrl || req.path || req.originalUrl || 'unknown';
    const statusCode = res.statusCode ? res.statusCode.toString() : '500';

    httpRequestCounter.inc({
      method: req.method,
      route,
      status_code: statusCode
    });

    httpRequestDuration.observe(
      {
        method: req.method,
        route,
        status_code: statusCode
      },
      durationInSeconds
    );
  });

  next();
};

const getMetrics = async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
};

module.exports = {
  register,
  metricsMiddleware,
  getMetrics
};
