exports.internalServerError = (error, res) => {
    console.error(error);
    res.status(500).json({
        success: false,
        message: "Internal server error"
    });
}

exports.badRequest = (res, message) => {
    res.status(400).json({
        success: false,
        message: message
    });
}

exports.conflict = (res, message) => {
    res.status(409).json({
        success: false,
        message: message
    });
}

exports.unauthorized = (res, message) => {
    res.status(401).json({
        success: false,
        message: message
    });
}