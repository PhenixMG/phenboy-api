const User = require('./User');
const Post = require('./Post');
const Thread = require('./Thread');
const Category = require('./Category');
const RefreshToken = require('./RefreshToken');

function initModels() {
    // Post <-> Thread
    Thread.hasMany(Post, { foreignKey: 'threadId', onDelete: 'CASCADE' });
    Post.belongsTo(Thread, { foreignKey: 'threadId' });

    // Post <-> User
    User.hasMany(Post, { foreignKey: 'userId', onDelete: 'CASCADE' });
    Post.belongsTo(User, { foreignKey: 'userId' });

    // Thread <-> Category
    Category.hasMany(Thread, { foreignKey: 'categoryId', onDelete: 'CASCADE' });
    Thread.belongsTo(Category, { foreignKey: 'categoryId' });

    // RefreshToken <-> User
    User.hasMany(RefreshToken, { foreignKey: 'userId', onDelete: 'CASCADE' });
    RefreshToken.belongsTo(User, { foreignKey: 'userId' });
}

module.exports = initModels;
