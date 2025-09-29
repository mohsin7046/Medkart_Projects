import client from 'prom-client';

const register = new client.Registry();


const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['status_class'], 
});

const httpResponseTime = new client.Summary({
  name: 'http_response_time_seconds',
  help: 'Response time in seconds',
});


register.registerMetric(httpRequestCounter);
register.registerMetric(httpResponseTime);


const requestMetricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000; 
    httpResponseTime.observe(duration);

    let statusClass = 'other';
    if (res.statusCode >= 200 && res.statusCode < 300) statusClass = '2xx';
    else if (res.statusCode >= 400 && res.statusCode < 500) statusClass = '4xx';
    else if (res.statusCode >= 500 && res.statusCode < 600) statusClass = '5xx';

    httpRequestCounter.inc({ status_class: statusClass });

  });

  next();
};


const getMainMetrics = async () => {

  const counters = httpRequestCounter.hashMap || {};
  const summary = httpResponseTime.get().values || [];
  const totalRequests = Object.values(counters).reduce((acc, metric) => acc + metric.value, 0);
  const successfulRequests = counters['status_class:2xx']?.value || 0;
  const clientErrors = counters['status_class:4xx']?.value || 0;
  const serverErrors = counters['status_class:5xx']?.value || 0;

  const avgResponseTime = summary.length > 0
    ? summary.reduce((acc, metric) => acc + metric.value, 0) / summary.length
    : 0;

  return `
# HELP http_requests_total Total HTTP requests
# TYPE http_requests_total counter
http_requests_total ${totalRequests}

# HELP http_requests_successful_total Successful requests (2xx)
# TYPE http_requests_successful_total counter
http_requests_successful_total ${successfulRequests}

# HELP http_requests_client_error_total Client errors (4xx)
# TYPE http_requests_client_error_total counter
http_requests_client_error_total ${clientErrors}

# HELP http_requests_server_error_total Server errors (5xx)
# TYPE http_requests_server_error_total counter
http_requests_server_error_total ${serverErrors}

# HELP http_response_time_avg Average response time in seconds
# TYPE http_response_time_avg gauge
http_response_time_avg ${avgResponseTime.toFixed(3)}
  `;
};

export {
  register,
  requestMetricsMiddleware,
  getMainMetrics
};




// # Run Grafana directly
// sudo grafana-server --homepath=/usr/share/grafana 

// # Check if it's running
// ps aux | grep grafana