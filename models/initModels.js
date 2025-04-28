// --------------------------------------------------------
// Cette fonction initialise toutes les relations (associations)
// entre les modèles Sequelize de l'application.
// À appeler une seule fois au démarrage, avant tout sync ou requête.
// --------------------------------------------------------

// Import des modèles
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
 * Doit être appelé une seule fois avant l'utilisation de Sequelize.
 */
function initModels() {

    /**
     * 📚 Forum Relations
     * Gestion des threads, posts et catégories dans le forum.
     */

    // Un Thread contient plusieurs Posts. Suppression en cascade si on supprime un thread.
    Thread.hasMany(Post, { foreignKey: 'threadId', onDelete: 'CASCADE' });
    // Chaque Post appartient à un Thread.
    Post.belongsTo(Thread, { foreignKey: 'threadId' });

    // Un Post est rédigé par un utilisateur. Cascade si on supprime l'utilisateur.
    User.hasMany(Post, { foreignKey: 'userId', onDelete: 'CASCADE' });
    Post.belongsTo(User, { foreignKey: 'userId' });

    // Une Catégorie regroupe plusieurs Threads. Cascade si on supprime la catégorie.
    Category.hasMany(Thread, { foreignKey: 'categoryId', onDelete: 'CASCADE' });
    Thread.belongsTo(Category, { foreignKey: 'categoryId' });


    /**
     * 🔒 Auth & Sécurité
     * Lien entre l'utilisateur et ses tokens de rafraîchissement OAuth.
     */

    // Un utilisateur peut posséder plusieurs RefreshTokens.
    User.hasMany(RefreshToken, { foreignKey: 'userId', onDelete: 'CASCADE' });
    // Chaque RefreshToken appartient à un utilisateur.
    RefreshToken.belongsTo(User, { foreignKey: 'userId' });


    /**
     * 🤝 Discord Server
     * Configuration et relations liées aux serveurs Discord.
     */

    // Un utilisateur peut créer plusieurs serveurs sur la plateforme.
    User.hasMany(Server, { foreignKey: 'createdBy', onDelete: 'CASCADE' });
    // Chaque serveur appartient à un utilisateur créateur.
    Server.belongsTo(User, { foreignKey: 'createdBy', as: 'owner' });

    // Configuration des salons (channels) pour chaque serveur.
    Server.hasMany(ServerChannelConfig, {
        foreignKey: 'serverId',
        as: 'channelConfigs',
        onDelete: 'CASCADE'
    });
    ServerChannelConfig.belongsTo(Server, { foreignKey: 'serverId' });

    // Journaux de modération par serveur.
    Server.hasMany(ModerationLog, { foreignKey: 'serverId', onDelete: 'CASCADE' });
    ModerationLog.belongsTo(Server, { foreignKey: 'serverId' });

    // Système de niveaux par serveur pour les utilisateurs.
    Server.hasMany(UserLevel, { foreignKey: 'serverId', onDelete: 'CASCADE' });
    UserLevel.belongsTo(Server, { foreignKey: 'serverId' });

    // Snapshots des membres d'un serveur pour suivi historique.
    Server.hasMany(MemberSnapshot, { foreignKey: 'serverId', onDelete: 'CASCADE' });
    MemberSnapshot.belongsTo(Server, { foreignKey: 'serverId' });


    /**
     * 🎮 Module The Division 2
     * Gestion des raids et de leurs participants pour chaque serveur.
     */

    // Un serveur peut héberger plusieurs raids.
    Server.hasMany(Raid, {
        foreignKey: 'serverId',
        as: 'raids',
        onDelete: 'CASCADE'
    });
    // Chaque raid appartient à un serveur.
    Raid.belongsTo(Server, { foreignKey: 'serverId', as: 'server' });

    // Un raid comporte plusieurs participants.
    Raid.hasMany(RaidParticipant, {
        foreignKey: 'raidId',
        as: 'participants',
        onDelete: 'CASCADE'
    });
    // Chaque participant est lié à un raid.
    RaidParticipant.belongsTo(Raid, { foreignKey: 'raidId', as: 'raid' });

}

module.exports = initModels;
