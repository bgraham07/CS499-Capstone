/**
 * Middleware to add security headers to all responses
 */

const securityHeaders = () => {
  return (req, res, next) => {
    // Prevent browsers from incorrectly detecting non-scripts as scripts
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Prevent clickjacking by disallowing the page to be embedded in an iframe
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Prevent XSS attacks by enabling the browser's XSS filter
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Restrict where resources can be loaded from
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; object-src 'none'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self'; frame-src 'none'; connect-src 'self'");
    
    // Prevent information leakage
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Disable caching for API responses
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    
    // Remove X-Powered-By header
    res.removeHeader('X-Powered-By');
    
    next();
  };
};

module.exports = securityHeaders;