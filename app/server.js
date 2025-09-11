const express = require("express");
const client = require("prom-client");

const app = express();
const register = new client.Registry();

// Default metrics (CPU, memory, event loop)
client.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"]
});

const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Histogram of request durations",
  labelNames: ["method", "route", "status"],
  buckets: [0.1, 0.3, 0.5, 1, 2, 5]
});

register.registerMetric(httpRequestCounter);
register.registerMetric(httpRequestDuration);

// Middleware to measure metrics
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on("finish", () => {
    httpRequestCounter.inc({ method: req.method, route: req.path, status: res.statusCode });
    end({ method: req.method, route: req.path, status: res.statusCode });
  });
  next();
});

// Example endpoints
app.get("/", (req, res) => {
  res.send("Hello from Node.js Observability project, Canary deployment🚀");
});

// Simulate slow request (2 seconds)
app.get("/slow", async (req, res) => {
  const end = httpRequestDuration.startTimer();
  await new Promise(resolve => setTimeout(resolve, 2000)); // 2s delay
  end({ route: "/slow", status: 200, method: "GET" });
  res.send("This was slow...");
});

app.get("/error", (req, res) => {
  res.status(500).send("Simulated error ❌");
});

// Expose metrics
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.listen(3000, () => {
  console.log("App running on http://localhost:3000");
  console.log("Metrics exposed at http://localhost:3000/metrics");
});
