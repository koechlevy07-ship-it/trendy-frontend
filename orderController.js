const { AuditLog } = require('../models/AuditLog');
const { sendSuccess } = require('../utils/apiResponse');
const { QueryFeatures } = require('../utils/queryFeatures');

async function listAuditLogs(req, res, next) {
  try {
    let query = AuditLog.find({}).populate('actor', 'firstName lastName email role');
    const features = new QueryFeatures(query, req.query);
    features.filter().sort().paginate();

    const [logs, total] = await Promise.all([features.mongooseQuery, AuditLog.countDocuments()]);

    return sendSuccess(res, 200, { logs }, {
      page: features.pagination.page,
      limit: features.pagination.limit,
      total,
      totalPages: Math.ceil(total / features.pagination.limit),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { listAuditLogs };
