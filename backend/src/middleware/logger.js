const SystemLog = require("../models/SystemLog.js");

const logger = (req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  
  // Log when request starts
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - Pending...`);

  // Log when request finishes
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);

    const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";
    SystemLog.create({
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: duration,
      level,
      userId: req.user?._id || null,
      role: req.user?.role || null,
      ip: req.ip || req.socket?.remoteAddress || null
    }).catch((error) => {
      console.error("[LOGGER] failed to persist system log", error.message);
    });
  });

  next();
};

module.exports = logger;
