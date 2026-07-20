const { User, ROLES } = require('../models/User');
const { ApiError } = require('../utils/ApiError');
const { sendSuccess } = require('../utils/apiResponse');
const { QueryFeatures } = require('../utils/queryFeatures');
const { recordAudit } = require('../models/AuditLog');

async function listUsers(req, res, next) {
  try {
    let query = User.find({});
    const features = new QueryFeatures(query, req.query);
    features.filter().search(['firstName', 'lastName', 'email']).sort().paginate();

    const [users, total] = await Promise.all([features.mongooseQuery, User.countDocuments()]);

    return sendSuccess(res, 200, { users: users.map((u) => u.toSafeJSON()) }, {
      page: features.pagination.page,
      limit: features.pagination.limit,
      total,
      totalPages: Math.ceil(total / features.pagination.limit),
    });
  } catch (err) {
    next(err);
  }
}

async function getUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, 'User not found');
    return sendSuccess(res, 200, { user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

/**
 * Changes a user's role. Only super_admin can grant/revoke admin or super_admin —
 * a regular admin cannot escalate themselves or anyone else to admin.
 */
async function updateUserRole(req, res, next) {
  try {
    const { role } = req.body;
    if (!ROLES.includes(role)) throw new ApiError(400, 'Invalid role');

    if (role !== 'customer' && req.user.role !== 'super_admin') {
      throw new ApiError(403, 'Only a super_admin can grant admin privileges');
    }

    if (req.params.id === req.user._id.toString()) {
      throw new ApiError(400, 'You cannot change your own role');
    }

    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, 'User not found');

    const previousRole = user.role;
    user.role = role;
    await user.save({ validateBeforeSave: false });

    recordAudit({
      actorId: req.user._id,
      action: 'user.role_changed',
      targetType: 'User',
      targetId: user._id,
      metadata: { from: previousRole, to: role },
      ip: req.ip,
    });

    return sendSuccess(res, 200, { user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

async function setActiveStatus(req, res, next) {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') throw new ApiError(400, 'isActive must be a boolean');

    if (req.params.id === req.user._id.toString()) {
      throw new ApiError(400, 'You cannot deactivate your own account');
    }

    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, 'User not found');

    user.isActive = isActive;
    if (!isActive) user.refreshTokenHash = undefined; // force logout everywhere
    await user.save({ validateBeforeSave: false });

    recordAudit({
      actorId: req.user._id,
      action: isActive ? 'user.activated' : 'user.deactivated',
      targetType: 'User',
      targetId: user._id,
      ip: req.ip,
    });

    return sendSuccess(res, 200, { user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

module.exports = { listUsers, getUser, updateUserRole, setActiveStatus };
