// Add this near your other middleware imports
const securityHeaders = require('./app_api/middleware/securityHeaders');
const sanitizeMiddleware = require('./app_api/middleware/sanitize');

// Add security headers middleware before other middleware
app.use(securityHeaders());

// Add these lines after your express.json() middleware
app.use(sanitizeMiddleware.sanitizeParams());
app.use(sanitizeMiddleware.sanitizeQuery());
app.use('/api', sanitizeMiddleware.sanitizeBody());
