/**
 * Middleware global de gestion des erreurs Express.
 * Intercepte toute erreur passée via `next(err)` ou levée dans un `try/catch`.
 *
 * @middleware
 * @param {Error} err - Objet d'erreur
 * @param {Request} req - Objet Request Express
 * @param {Response} res - Objet Response Express
 * @param {Function} next - Fonction next() (nécessaire même si non utilisée)
 */
const errorHandler = (err, req, res, next) => {
    console.error(err.stack); // Log complet de l'erreur côté serveur

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
};

module.exports = errorHandler;
