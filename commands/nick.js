const Discord = require("discord.js");
const db = require("../scripts/db");
const mp = require("../scripts/msgPresets"); // TODO À retirer
const mLog = require("../scripts/mLog");

exports.run = (client, message, args) => {

    if (!message.member.roles.find(r => r.name === "Mentor")) {
        message.delete();
        mp.sendWIP(client.channels.get('415633143861739541'));
        return;
    } // TODO À retirer après le développement

    function sendToTemp(messageContent) {
        message.channel.send(messageContent);
    }

    var commandChannel = client.channels.get('415633143861739541');

    if (!args[0]) {
        let errorEmbed = new Discord.RichEmbed()
            .setAuthor("Aide")
            .setDescription("Changer de pseudonyme : **Strad nick <pseudonyme>**.\nRétablir le pseudonyme par défaut (gratuit) : **Strad nick default**.")
            .setColor(mLog.colors.NEUTRAL_BLUE);
        message.delete();
        // commandChannel.send(errorEmbed);
        sendToTemp(errorEmbed); // TODO À retirer
        return;
    } else if (args[0].toLowerCase() === "default") {
        message.member.setNickname(message.author.username);
        let successEmbed = new Discord.RichEmbed()
            .setAuthor("Changement de pseudonyme")
            .setDescription("Ton pseudonyme est revenu à la normale !")
            .setColor(mLog.colors.NEUTRAL_BLUE);
        message.delete();
        // commandChannel.send(errorEmbed);
        sendToTemp(successEmbed); // TODO À retirer
        return;
    }

    var newNickname = args[0],
        con = new db.Connection("localhost", client.config.mysqlUser, client.config.mysqlPass, "strad");

    con.query(`SELECT * FROM has_items WHERE user_id = "${message.member.id}" AND item_id = 1`, {}, rows => {
        if (!rows || rows[0]["amount"] < 1) {
            let errorEmbed = new Discord.RichEmbed()
                .setAuthor("Boutique")
                .setDescription("Pour avoir accès à ça, fais **Strad shop** !")
                .setColor(mLog.colors.SHOP);
            message.delete();
            // commandChannel.send(errorEmbed);
            sendToTemp(errorEmbed); // TODO À retirer
            con.end();
            return;
        }

        try {
            message.member.setNickname(newNickname);
        } catch (e) {
            let errorEmbed = new Discord.RichEmbed()
                .setAuthor("Changement de pseudonyme")
                .setDescription("Je ne peux pas te mettre ce pseudonyme, désolé !")
                .setColor(mLog.colors.ALERT);
            message.delete();
            // commandChannel.send(errorEmbed);
            sendToTemp(errorEmbed); // TODO À retirer
            con.end();
            return;
        }

        con.query(`UPDATE has_items SET amount = amount - 1`, {}, rows => {
            let successEmbed = new Discord.RichEmbed()
                .setAuthor("Changement de pseudonyme")
                .setDescription(`Génial, ta nouvelle identité est prête !`)
                .setColor(mLog.colors.VALID);
            message.delete();
            // commandChannel.send(successEmbed);
            sendToTemp(successEmbed); // TODO À retirer
        });
    });

};