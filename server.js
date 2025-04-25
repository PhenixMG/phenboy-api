const app = require('./app');
const { sequelize } = require('./db/database'); // 👈 Import propre depuis database.js

sequelize.sync({alter: true}).then(() => {
    app.listen(process.env.PORT || 3000, () => {
        console.log(`Server is running on port ${process.env.PORT || 3000}`);
    });
});
