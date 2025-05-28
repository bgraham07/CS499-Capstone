/**
 * Utility for optimizing MongoDB queries
 */

/**
 * Create optimized pagination parameters
 * @param {Object} query - Express request query object
 * @returns {Object} Optimized pagination parameters
 */
const createPaginationOptions = (query) => {
  // Default values
  const defaultLimit = 10;
  const maxLimit = 100;
  
  // Parse and validate page and limit
  let page = parseInt(query.page, 10) || 1;
  let limit = parseInt(query.limit, 10) || defaultLimit;
  
  // Ensure page is at least 1
  page = Math.max(1, page);
  
  // Ensure limit is between 1 and maxLimit
  limit = Math.min(Math.max(1, limit), maxLimit);
  
  // Calculate skip value
  const skip = (page - 1) * limit;
  
  return {
    skip,
    limit,
    page,
    maxLimit
  };
};

/**
 * Create optimized sort parameters
 * @param {Object} query - Express request query object
 * @param {Object} defaultSort - Default sort object
 * @returns {Object} MongoDB sort object
 */
const createSortOptions = (query, defaultSort = { createdAt: -1 }) => {
  if (!query.sort) {
    return defaultSort;
  }
  
  // Parse sort parameter (format: field:direction)
  const sortParams = query.sort.split(',');
  const sortObj = {};
  
  sortParams.forEach(param => {
    const [field, direction] = param.split(':');
    if (field && (direction === 'asc' || direction === 'desc')) {
      sortObj[field] = direction === 'asc' ? 1 : -1;
    }
  });
  
  // If no valid sort parameters, use default
  return Object.keys(sortObj).length > 0 ? sortObj : defaultSort;
};

/**
 * Create optimized field projection
 * @param {Object} query - Express request query object
 * @param {Array} allowedFields - List of fields that can be included/excluded
 * @returns {Object} MongoDB projection object
 */
const createProjection = (query, allowedFields = []) => {
  if (!query.fields || !allowedFields.length) {
    return {};
  }
  
  const fields = query.fields.split(',');
  const projection = {};
  
  fields.forEach(field => {
    // Check if field is in allowed list
    if (allowedFields.includes(field)) {
      projection[field] = 1;
    }
  });
  
  return projection;
};

/**
 * Create optimized filter object
 * @param {Object} query - Express request query object
 * @param {Object} filterMapping - Mapping of query params to DB fields
 * @returns {Object} MongoDB filter object
 */
const createFilterOptions = (query, filterMapping = {}) => {
  const filter = {};
  
  // Process each filter in the mapping
  Object.keys(filterMapping).forEach(param => {
    if (query[param] !== undefined) {
      const dbField = filterMapping[param];
      const value = query[param];
      
      // Handle different filter types
      if (typeof dbField === 'string') {
        // Simple equality filter
        filter[dbField] = value;
      } else if (typeof dbField === 'object') {
        // Complex filter with operator
        const { field, operator } = dbField;
        
        if (!filter[field]) {
          filter[field] = {};
        }
        
        switch (operator) {
          case 'gt':
            filter[field].$gt = Number(value);
            break;
          case 'gte':
            filter[field].$gte = Number(value);
            break;
          case 'lt':
            filter[field].$lt = Number(value);
            break;
          case 'lte':
            filter[field].$lte = Number(value);
            break;
          case 'in':
            filter[field].$in = value.split(',');
            break;
          case 'regex':
            filter[field].$regex = new RegExp(value, 'i');
            break;
        }
      }
    }
  });
  
  return filter;
};

/**
 * Create optimized query options
 * @param {Object} req - Express request object
 * @param {Object} options - Configuration options
 * @returns {Object} Optimized query options
 */
const optimizeQuery = (req, options = {}) => {
  const {
    defaultSort = { createdAt: -1 },
    allowedFields = [],
    filterMapping = {}
  } = options;
  
  // Get pagination, sort, projection, and filter options
  const pagination = createPaginationOptions(req.query);
  const sort = createSortOptions(req.query, defaultSort);
  const projection = createProjection(req.query, allowedFields);
  const filter = createFilterOptions(req.query, filterMapping);
  
  return {
    filter,
    options: {
      skip: pagination.skip,
      limit: pagination.limit,
      sort,
      projection: Object.keys(projection).length > 0 ? projection : null
    },
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      totalPages: null, // To be filled after query execution
      totalResults: null // To be filled after query execution
    }
  };
};

module.exports = {
  optimizeQuery,
  createPaginationOptions,
  createSortOptions,
  createProjection,
  createFilterOptions
};