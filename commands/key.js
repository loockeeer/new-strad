const Discord = require("discord.js");
const db = require("../scripts/db");
const mLog = require("../scripts/mLog");
const sendMP = require("../scripts/sendMP");
let moment = require("moment");

exports.run = async (client, message, args) => {

    const blockEmoji = client.assets.emojis.BLOCK;

    function _randomChar() {
        let possibleChars = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N",
            "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "1", "2", "3", "4", "5", "6", "7", "8", "9"], randomNumber;
        randomNumber = Math.floor(Math.random() * possibleChars.length);
        return possibleChars[randomNumber];
    }

    function createKey() {
        let res = "", keyFace = [];

        for (let i=0;i<4;i++) {
            res = "";
            for (let j=0;j<4;j++) {
                res += _randomChar();
            }
            keyFace[i] = res;
        }

        return keyFace.join("-");
    }

    function createFingerPrint() {
        let part1 = "", part2 = "";

        for (let i=0;i<2;i++) {
            part1 += _randomChar();
        }
        for (let i=0;i<4;i++) {
            part2 += _randomChar();
        }

        return part1 + "-" + part2;
    }

    function keyExists(rows, keyFace) {
        let b = false;
        for (let i=0;i<rows.length;i++) {
            if (rows[i]["key_face"] === keyFace) b = true;
        }
        return b;
    }

    function printExists(rows, keyPrint) {
        let b = false;
        for (let i=0;i<rows.length;i++) {
            if (rows[i]["key_print"] === keyPrint) b = true;
        }
        return b;
    }

    let commandChannel = client.channels.get('415633143861739541'), chosenValue;
    let minAllowedValue = 50, maxAllowedValue = 15000;

    if (!args[0] || isNaN(args[0])) {
        let errorEmbed = new Discord.RichEmbed()
            .setAuthor("Commande erronée")
            .setDescription("Merci de saisir une valeur en Blocs valide. Utilisation : ``Strad key <valeur>``.")
            .setColor(mLog.colors.ALERT);
        message.delete();
        commandChannel.send(errorEmbed);
        return;
    } else
        chosenValue = parseInt(args[0]);

    if ((chosenValue < minAllowedValue) || (chosenValue > maxAllowedValue)) {
        let errorEmbed = new Discord.RichEmbed()
            .setAuthor("Création de clé impossible")
            .setDescription("Tu dois saisir une valeur en Blocs comprise entre 50 et 15000.")
            .setColor(mLog.colors.ALERT);
        message.delete();
        commandChannel.send(errorEmbed);
        return;
    }

    let keyFace = createKey(), keyPrint = createFingerPrint(), todayDate = moment().format('DD/MM/YY');
    let con = new db.Connection("localhost", client.config.mysqlUser, client.config.mysqlPass, "strad");

    let money = (await con.query(`SELECT money FROM users WHERE user_id = "${message.author.id}"`))[0].money,
        keys = await con.query(`SELECT * FROM blocks_keys`);

    if (chosenValue > money) {
        let errorEmbed = new Discord.RichEmbed()
            .setAuthor("Création de clé impossible")
            .setDescription(`Tu n'as pas assez de Blocs pour créer cette clé. Il te manque **${chosenValue - money}** ${blockEmoji} !`)
            .setColor(mLog.colors.ALERT);
        message.delete();
        commandChannel.send(errorEmbed);
        con.end();
        return;
    }

    if (keys[0]) {
        while (keyExists(keys, keyFace)) {
            keyFace = createKey();
        }
        while (printExists(keys, keyPrint)) {
            keyPrint = createFingerPrint();
        }
    }

    await con.query(`UPDATE users SET money = money - ${chosenValue} WHERE user_id = "${message.author.id}"`);
    await con.query(`INSERT INTO blocks_keys (key_face, key_print, key_value, creator_id, creation_date)
        VALUES ("${keyFace}", "${keyPrint}", ${chosenValue}, "${message.author.id}",
                "${moment().format('DD/MM/YY')}")`);

    let publicSuccessEmbed = new Discord.RichEmbed()
        .setAuthor("Création effectuée")
        .setDescription("Ta clé a correctement été débloquée. Tu viens de la recevoir en message privé !")
        .setFooter("Strad key <valeur>")
        .setColor(mLog.colors.VALID);
    message.delete();
    commandChannel.send(publicSuccessEmbed);

    let privateSuccessEmbed = new Discord.RichEmbed()
        .setAuthor("Création de clé")
        .setDescription("Voici ta clé d'une valeur de **" + chosenValue + "**" + blockEmoji + " (clique pour l'afficher) :\n"
            + "||```" + keyFace + "```||\nFais bien attention de ne pas la partager à n'importe qui !\n"
            + "Afin de l'utiliser, le bénéficiaire de la clé devra taper la commande : ``Strad redeem <clé>``. Il recevra ainsi la valeur en Blocs de la clé !")
        .addField("Empreinte de la clé", "```" + keyPrint + "```"
            + "\nNote : L'empreinte n'est pas secrète, elle est directement liée à ta clé. Tu peux partager l'empreinte au destinataire de celle-ci "
            + "afin d'attester qu'elle t'appartient, qu'elle est valide et qu'elle a bien la valeur en Blocs annoncée. Cela peut se révéler bien utile dans le cas d'un échange !")
        .setColor(mLog.colors.NEUTRAL_BLUE);
    sendMP.run(client, privateSuccessEmbed, message.member);

    mLog.run(client, "Création de clé", message.author + " a créé une clé d'empreinte ``" + keyPrint + "`` et d'une valeur de **" + chosenValue + "** " + blockEmoji + ".",
        mLog.colors.NEUTRAL_BLUE);

    con.end();

};