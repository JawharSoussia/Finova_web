const User = require('../models/User');

const activityLogger = async (req, res, next) => {
    const originalSend = res.send;
    const userId = req.user?.userId;

    if (!userId) {
        return next();
    }

    // Override res.send to capture the response
    res.send = function (data) {
        res.send = originalSend;
        const result = res.send.call(this, data);

        // Log the activity after the response is sent
        try {
            const user = User.findById(userId);
            if (user) {
                const action = `${req.method} ${req.originalUrl}`;
                const details = getActivityDetails(req);
                const ipAddress = req.ip;
                const deviceInfo = req.headers['user-agent'];

                user.logActivity(action, details, ipAddress, deviceInfo);
            }
        } catch (error) {
            console.error('Error logging activity:', error);
        }

        return result;
    };

    next();
};

// Helper function to get activity details based on the request
const getActivityDetails = (req) => {
    const { method, originalUrl, body } = req;

    // Don't log sensitive information
    const sanitizedBody = { ...body };
    if (sanitizedBody.password) {
        sanitizedBody.password = '[REDACTED]';
    }
    if (sanitizedBody.token) {
        sanitizedBody.token = '[REDACTED]';
    }

    switch (method) {
        case 'POST':
            return `Created new ${getResourceType(originalUrl)}`;
        case 'PUT':
            return `Updated ${getResourceType(originalUrl)}`;
        case 'DELETE':
            return `Deleted ${getResourceType(originalUrl)}`;
        case 'GET':
            return `Viewed ${getResourceType(originalUrl)}`;
        default:
            return `${method} request to ${originalUrl}`;
    }
};

// Helper function to get resource type from URL
const getResourceType = (url) => {
    if (url.includes('/transactions')) return 'transaction';
    if (url.includes('/savings')) return 'savings goal';
    if (url.includes('/profile')) return 'profile';
    if (url.includes('/settings')) return 'settings';
    return 'resource';
};

module.exports = activityLogger; 