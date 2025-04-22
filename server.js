const { app, sequelize } = require('./app');

sequelize.sync({ alter: true }).then(() => {
    app.listen(process.env.PORT || 3000, () => {
        console.log(`Server is running on port ${process.env.PORT || 3000}`);
    });
});