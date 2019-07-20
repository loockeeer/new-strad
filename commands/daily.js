const Discord = require("discord.js");
var moment = require("moment");
const mLog = require("../scripts/mLog");

exports.run = (client, message, args) => {

  moment.locale("fr");

  try {
    // DB connection
    var gb = {embed: undefined, uv: undefined, dv: undefined, finalReward: 50, finalCreaReward: 0};
    var mysql = require("mysql");

    var con = mysql.createConnection({
      host: "localhost",
      user: client.config.mysqlUser,
      password: client.config.mysqlPass,
      database: "strad"
    });

    con.connect((err) => {
      if (err) console.log(err);
    });

    con.query(`SELECT * FROM users WHERE user_id = "${message.author.id}"`, function (err, rows, fields) {

      if (err) {
        console.log(err);
      }

      if (rows[0].lastdaily != moment().format("DD/MM/YY")) { // Si l'utilisateur n'a pas encore demandé son daily aujourd'hui, alors...

        con.query(`SELECT * FROM rewards WHERE rewarded_id = "${message.author.id}" AND type = "UV"`, function (err, rows, fields) { // Récupération des UVs
          if (err) {
            console.log(err);
          }

          if (rows) {
            gb.uv = rows.length;
          } else {
            gb.uv = 0;
          }

          con.query(`SELECT * FROM rewards WHERE rewarded_id = "${message.author.id}" AND type = "DV"`, function (err, rows, fields) { // Récupération des DVs
            if (err) {
              console.log(err);
            }
          
            if (rows) {
              gb.dv = rows.length;
            } else {
              gb.dv = 0;
            }

            gb.finalReward += gb.uv * 5;
            gb.finalCreaReward += gb.uv - gb.dv;
            if (gb.finalCreaReward < 0) gb.finalCreaReward = 0;

            con.query(`DELETE FROM rewards WHERE rewarded_id = "${message.author.id}"`, function (err, rows, fields) { // Suppression des votes
              if (err) {
                console.log(err);
              }
            });

            con.query(`UPDATE users SET money = money + ${gb.finalReward}, creas_amount = creas_amount + ${gb.finalCreaReward}, usertag = "${message.member.displayName}" WHERE user_id = "${message.author.id}"`, function (err, rows, fields) {
              if (err) {
                console.log(err);
              }

              con.query(`UPDATE users SET lastdaily = "${moment().format('DD/MM/YY')}" WHERE user_id = "${message.author.id}"`, function (err, rows, fields) {
                if (err) {
                  console.log(err);
                }

                gb.embed = new Discord.RichEmbed()
                  .setAuthor("Récompense quotidienne (" + message.member.displayName + ")", message.author.avatarURL)
                  .setColor(mLog.colors.VALID)
                  .addField(`Blocs`, `+ **${gb.finalReward}** <:block:547449530610745364>`, true)
                  .addField(`Créas`, `+ **${gb.finalCreaReward}** <:crea:547482886824001539>`, true)
                  .setDescription(`Voici ta récompense journalière ! Pour accéder à ton compte, fais : Strad rank\n**${gb.uv} <:like:568493894270976012> / ${gb.dv} <:dislike:568493872968368149>**`)
                  .setFooter("Strad daily");

                client.channels.get('415633143861739541').send(gb.embed);
                message.delete();

                con.end();
              });
            });
          });
        });

      } else {

        gb.embed = new Discord.RichEmbed()
          .setAuthor("Récompense quotidienne (" + message.member.displayName + ")", message.author.avatarURL)
          .setColor(mLog.colors.ALERT)
          .setDescription(`Tu as déjà obtenu ta récompense aujourd'hui.\nAttends ${moment(new Date()).add(1, "days").toNow(true)} avant de la récupérer !`)
          .setFooter("Strad daily");

        client.channels.get('415633143861739541').send(gb.embed);
        message.delete();
        
        con.end();

      }

    });

  } catch (err) {
    console.log(err);
  }

};