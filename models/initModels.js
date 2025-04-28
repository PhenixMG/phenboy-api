// Modèles importés
const User = require('./User');
const Post = require('./Post');
const Thread = require('./Thread');
const Category = require('./Category');
const RefreshToken = require('./RefreshToken');
const ServerChannelConfig = require('./ServerChannelConfig');
const Server = require('./Server');
const ModerationLog = require('./ModerationLog');
const UserLevel = require('./UserLevel');
const MemberSnapshot = require('./MemberSnapshot');
const Raid = require('./Raid');
const RaidParticipant = require('./RaidParticipant');

/**
 * 🔗 Initialise toutes les relations entre les modèles Sequelize.
 * À appeler une seule fois avant la synchronisation ou utilisation.
 *
 * @function initModels
 * @example
 * const initModels = require('./models/initModels');
 * initModels();
 */
function initModels() {
    /** Forum Relations **/

    // Un Thread contient plusieurs Posts
    Thread.hasMany(Post, { foreignKey: 'threadId', onDelete: 'CASCADE' });
    Post.belongsTo(Thread, { foreignKey: 'threadId' });

    // Un Post appartient à un User
    User.hasMany(Post, { foreignKey: 'userId', onDelete: 'CASCADE' });
    Post.belongsTo(User, { foreignKey: 'userId' });

    // Une Catégorie contient plusieurs Threads
    Category.hasMany(Thread, { foreignKey: 'categoryId', onDelete: 'CASCADE' });
    Thread.belongsTo(Category, { foreignKey: 'categoryId' });

    /** Auth & Sécurité **/

    // Un User peut avoir plusieurs RefreshTokens
    User.hasMany(RefreshToken, { foreignKey: 'userId', onDelete: 'CASCADE' });
    RefreshToken.belongsTo(User, { foreignKey: 'userId' });

    /** Discord Server **/

    // Un User peut créer plusieurs serveurs
    User.hasMany(Server, { foreignKey: 'createdBy', onDelete: 'CASCADE' });
    Server.belongsTo(User, { foreignKey: 'createdBy' });

    // Config des salons liés à un Server
    Server.hasMany(ServerChannelConfig, { foreignKey: 'serverId', as: 'channelConfigs', onDelete: 'CASCADE' });
    ServerChannelConfig.belongsTo(Server, { foreignKey: 'serverId' });

    // Logs de modération pour un serveur
    Server.hasMany(ModerationLog, { foreignKey: 'serverId', onDelete: 'CASCADE' });
    ModerationLog.belongsTo(Server, { foreignKey: 'serverId' });

    // Système de level
    Server.hasMany(UserLevel, { foreignKey: 'serverId', onDelete: 'CASCADE' });
    UserLevel.belongsTo(Server, { foreignKey: 'serverId' });

    // Snapshots de membres
    Server.hasMany(MemberSnapshot, { foreignKey: 'serverId', onDelete: 'CASCADE' });
    MemberSnapshot.belongsTo(Server, { foreignKey: 'serverId' });

    /** Module The Division 2 **/

    // Serveur ↔ Raids
    Server.hasMany(Raid,   { foreignKey: 'serverId', as: 'raids' });
    Raid.belongsTo(Server, { foreignKey: 'serverId', as: 'server' });

    // Raid ↔ Participants
    Raid.hasMany(RaidParticipant,     { foreignKey: 'raidId', as: 'participants' });
    RaidParticipant.belongsTo(Raid,   { foreignKey: 'raidId', as: 'raid' });

}

module.exports = initModels;
