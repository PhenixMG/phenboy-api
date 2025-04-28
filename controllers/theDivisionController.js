const Td2Activity = require("../models/Td2Activity");
const Td2Blacklist = require("../models/Td2Blacklist");

// Activités
exports.getAllTd2Activities = async (req, res) => {
    try{
        let guildId = req.params.guildId;
        const activities = await Td2Activity.findAll({
            where: {
                serverDiscordId: guildId
            }
        })
        res.json(activities);
    } catch (err) {
        res.status(500).json({ error: 'Failed to retrieve activites list' });
    }
}

exports.createTd2Activity = async (req, res) => {
    try{
        const activity = await Td2Activity.create(req.body);

        res.status(201).json(activity);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message });
    }
}

exports.updateTd2Activity = async (req, res) => {
    try{
        const activity = await Td2Activity.findByPk(req.params.activityId);
        if (!activity) return res.status(404).json({ error: 'Activité non trouvée' });

        await activity.update(req.body);

        res.json(activity);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.deleteTd2Activity = async (req, res) => {
    try{
        const activity = await Td2Activity.findByPk(req.params.activityId);
        if (!activity) return res.status(404).json({ error: 'Activité non trouvée' });

        await activity.destroy();

        res.sendStatus(204);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Blacklist
exports.getAllBlacklist = async (req, res) => {
    try{
        let guildId = req.params.guildId;
        const blacklist = await Td2Blacklist.findAll({
            where: {
                guildId: guildId
            }
        })
        res.json(blacklist);
    } catch (err){
        return res.status(500).json({ error: 'Failed to retrieve blacklist list' });
    }
}

exports.addBlacklist = async (req, res) => {
    try{
        const blacklist = await Td2Blacklist.create(req.body);

        res.status(201).json(blacklist);
    }  catch (err){
        return res.status(500).json({ error: 'Failed to retrieve blacklist list' });
    }
}

exports.deleteBlacklist = async (req, res) => {
    try{
        const blacklist = await Td2Blacklist.findByPk(req.params.userId);
        if (!blacklist) return res.status(404).json({ error: 'Blacklist not found' });

        await blacklist.destroy();

        res.sendStatus(204);
    }  catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.updateBlacklist = async (req, res) => {
    try{
        let blacklist = await Td2Blacklist.findByPk(req.params.activityId);
        if (!blacklist) return res.status(404).json({ error: 'Blacklist not found' });

        await blacklist.update(req.body);

        res.sendStatus(204);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}