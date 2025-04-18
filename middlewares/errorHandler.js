// Middleware pour capter toutes les erreurs
const errorHandler = (err, req, res) => {
    console.error(err.stack);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
};

module.exports = errorHandler;
