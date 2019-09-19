const Discord = require('discord.js');
const welcome = require('../scripts/welcome.js');
const db = require("../scripts/db");
const mLog = require("../scripts/mLog");
const sendMP = require("../scripts/sendMP");

module.exports = async (client, member) => {
    // Récupération du salon de modération
    const logs = client.channels.get(client.config.logsChannel);

    // Récupération de la catégorie de bienvenue
    const welcomeCategId = "443782424653070346";

    // On vérifie si l'évènement a lieu sur Stradivarius
    if (member.guild.id = '412369732679893004') {
        const apprenti = member.guild.roles.find(x => x.name === "Apprenti(e)");
        member.addRole(apprenti).catch(console.error);

        let con = new db.Connection("localhost", client.config.mysqlUser, client.config.mysqlPass, "strad"),
            embed = new Discord.RichEmbed()
                .setColor(mLog.colors.NEUTRAL_BLUE)
                .setTitle("Nouveau Membre")
                .setDescription(`**<@${member.user.id}>** vient de rejoindre le serveur !`);

        let user = (await con.query(`SELECT * FROM users WHERE user_id = "${member.user.id}"`))[0];

        if (!user) {
            await con.query(`INSERT INTO users (user_id, usertag) VALUES ("${member.user.id}", "${member.user.tag}")`);
        }

        let welcomeMessage = `Bienvenue, toi :wink: Tu penses qu'on pourra devenir amis ?\n`
            + `Au fait, je viens de t'ajouter le rôle d'**Apprenti**, le temps que tu te présentes dans le salon #présentation :smile:\n`
            + `On a tous envie de te connaître ! :violin:\n\n`
            + `> https://discord.gg/4MmJwgj`;
        sendMP.run(client, welcomeMessage, member);

        member.guild.channels.find(c => c.id === welcomeCategId).setName("STRADIVARIUS | " + member.guild.memberCount + " MEMBRES");
        logs.send(embed);
        console.log(member.user.username + " a rejoint le serveur !");

        con.end();
    }
};