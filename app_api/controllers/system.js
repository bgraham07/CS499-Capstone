const { checkConnection } = require('../models/db');
const mongoose = require('mongoose');

/**
 * GET /api/system/health
 * Check system health including database connection
 */
const healthCheck = async (req, res) => {
  try {
    // Check database connection
    const dbStatus = checkConnection();
    
    // Get some basic stats about the database
    let dbStats = null;
    if (dbStatus.isConnected) {
      try {
        dbStats = await mongoose.connection.db.stats();
      } catch (err) {
        console.error('Error getting DB stats:', err);
      }
    }
    
    // Build response
    const health = {
      status: dbStatus.isConnected ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: dbStatus.status,
        connected: dbStatus.isConnected,
        stats: dbStats ? {
          collections: dbStats.collections,
          documents: dbStats.objects,
          dataSize: `${(dbStats.dataSize / 1024 / 1024).toFixed(2)} MB`,
          indexes: dbStats.indexes,
          indexSize: `${(dbStats.indexSize / 1024 / 1024).toFixed(2)} MB`
        } : null
      },
      memory: {
        rss: `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`,
        heapUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`
      }
    };
    
    // Send appropriate status code based on health
    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (err) {
    console.error('Health check error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error performing health check',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

module.exports = {
  healthCheck
};