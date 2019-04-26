const Discord = require("discord.js");
const db = require("../scripts/db");
const mysql = require("mysql");

// const db_handler = require("../scripts/db.js");

exports.run = (client, message, args) => {

    // DB connection

    var gb = {
        results: undefined, rank: undefined
    };

    try {

        var pool = mysql.createPool({
            host: "localhost",
            user: client.config.mysqlUser,
            password: client.config.mysqlPass,
            database: "strad"
        });

        db.executeQuery(pool, `SELECT * FROM users WHERE user_id = ${message.author.id}`, (err, rows) => {

            gb.results = rows[0];

            db.executeQuery(pool, `SELECT * FROM users ORDER BY creas_amount DESC`, (err, rows) => {

                for (i = 0; i < rows.length; i++) {
                    if (message.author.id == rows[i].user_id) {
                        gb.rank = i + 1;
                        break;
                    }
                }

                const stradEmoji = "<:block:547449530610745364>";
                const creaEmoji = "<:crea:547482886824001539>";

                const embedMoney = new Discord.RichEmbed()
                    .setAuthor(message.author.tag, message.author.avatarURL)
                    .setThumbnail(message.author.avatarURL)
                    .addField("Valeur du compte", `${gb.results.money} ${stradEmoji}`, true)
                    .addField("Nombre de Créas", `${gb.results.creas_amount} ${creaEmoji}`, true)
                    .addField("Rang", `#${gb.rank}`, true)
                    .addField("Titre artistique", `${gb.results.rank}`, true)
                    .setFooter("Strad rank")
                    .setColor(message.member.displayColor);

                client.channels.get('415633143861739541').send(embedMoney);
                message.delete();

            })

        });


    } catch (err) {

        console.log(err);

    }

};