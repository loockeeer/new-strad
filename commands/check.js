const Discord = require("discord.js");
const db = require("../scripts/db");
const mLog = require("../scripts/mLog");

exports.run = async (client, message, args) => {

    function findKey(rows, keyPrint) {
        let key = null;
        for (let i=0;i<rows.length;i++) {
            if (rows[i]["key_print"] === keyPrint) key = rows[i];
        }
        return key;
    }

    let commandChannel = client.channels.get('415633143861739541');

    if (!args[0]) {
        let errorEmbed = new Discord.RichEmbed()
            .setAuthor("Commande erronée")
            .setDescription("Merci de saisir l'empreinte de la clé à vérifier. Utilisation : ``Strad check <empreinte>``.")
            .setColor(mLog.colors.ALERT);
        message.delete();
        commandChannel.send(errorEmbed);
        return;
    }

    let keyPrint = args[0];
    let con = new db.Connection("localhost", client.config.mysqlUser, client.config.mysqlPass, "strad");

    let keys = await con.query(`SELECT * FROM blocks_keys`);

    if (keys[0]) {
        let key = findKey(keys, keyPrint);

        if (key) {
            let validEmoji = client.emojis.get("607877884413214720"),
                usedEmoji = client.emojis.get("607877912955322406"),
                blockEmoji = client.emojis.get("547449530610745364");

            let embedColor = key.recipient_id ? mLog.colors.ALERT : mLog.colors.VALID,
                keyOwner = client.guilds.find(g => g.id == "412369732679893004").members.find(m => m.id == key.creator_id).user,
                keyUser = key.recipient_id ? client.guilds.find(g => g.id == "412369732679893004").members.find(m => m.id == key.recipient_id).user : "-",
                validity = key.recipient_id ? "Utilisée " + usedEmoji : "Valide " + validEmoji,
                value = key.key_value,
                creationDate = ", le " + key.creation_date,
                redeemDate = key.recipient_id ? ", le " + key.redeem_date : "",
                keySimFace = "**" + key.key_face.slice(0, 1) + "**???-????-???**" + key.key_face.slice(-1) + "**";

            let infoEmbed = new Discord.RichEmbed()
                .setAuthor("Clé d'empreinte " + keyPrint)
                .setDescription("Les informations concernant la clé d'empreinte ``" + keyPrint + "`` sont affichées ci-dessous.")
                .addField("Apparence de la clé", keySimFace)
                .addField("Créée par", keyOwner + creationDate)
                .addField("Utilisée par", keyUser + redeemDate)
                .addField("Validité", validity)
                .addField("Valeur", value + " " + blockEmoji)
                .setFooter("Strad check <empreinte>")
                .setColor(embedColor);
            message.delete();
            commandChannel.send(infoEmbed);
            con.end();
        } else {
            let errorEmbed = new Discord.RichEmbed()
                .setAuthor("Clé introuvable")
                .setDescription("L'empreinte ``" + keyPrint + "`` n'est liée à aucune clé existante. Format : ``XX-XXXX``.")
                .setColor(mLog.colors.ALERT);
            message.delete();
            commandChannel.send(errorEmbed);
            con.end();
        }
    } else {
        let errorEmbed = new Discord.RichEmbed()
            .setAuthor("Clé introuvable")
            .setDescription("L'empreinte ``" + keyPrint + "`` n'est liée à aucune clé existante. Format : ``XX-XXXX``.")
            .setColor(mLog.colors.ALERT);
        message.delete();
        commandChannel.send(errorEmbed);
        con.end();
    }
    
};