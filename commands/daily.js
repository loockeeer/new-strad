const Discord = require("discord.js");
var moment = require("moment");

exports.run = (client, message, args, userData) => {

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
          console.log("gb.uv = " + gb.uv)

          con.query(`SELECT * FROM rewards WHERE rewarded_id = "${message.author.id}" AND type = "DV"`, function (err, rows, fields) { // Récupération des DVs
            if (err) {
              console.log(err);
            }
          
            if (rows) {
              gb.dv = rows.length;
            } else {
              gb.dv = 0;
            }
            console.log("gb.dv = " + gb.dv)

            gb.finalReward += gb.uv * 5;
            console.log(gb.finalReward)
            gb.finalCreaReward += gb.uv - gb.dv;
            console.log(gb.finalCreaReward)
            if (gb.finalCreaReward < 0) gb.finalCreaReward = 0;

            con.query(`DELETE FROM rewards WHERE rewarded_id = "${message.author.id}"`, function (err, rows, fields) { // Suppression des votes
              if (err) {
                console.log(err);
              }
            })

            con.query(`UPDATE users SET money = money + ${gb.finalReward}, creas_amount = creas_amount + ${gb.finalCreaReward} WHERE user_id = "${message.author.id}"`, function (err, rows, fields) {
              if (err) {
                console.log(err);
              }

              con.query(`UPDATE users SET lastdaily = "${moment().format('DD/MM/YY')}" WHERE user_id = "${message.author.id}"`, function (err, rows, fields) {
                if (err) {
                  console.log(err);
                }

                gb.embed = new Discord.RichEmbed()
                  .setAuthor("Récompense quotidienne (" + message.member.displayName + ")", message.author.avatarURL)
                  .setColor("#6cb254")
                  .addField(`Blocs`, `+ **${gb.finalReward}** <:block:547449530610745364>`, true)
                  .addField(`Créas`, `+ **${gb.finalCreaReward}** <:crea:547482886824001539>`, true)
                  .setDescription(`Voici ta récompense journalière (${gb.uv} <:like:419568361110896640> / ${gb.dv} <:dislike:419568377946832896>) ! Pour accéder à ton compte, fais : Strad rank`)
                  .setFooter("Strad daily");

                client.channels.get('415633143861739541').send(gb.embed);
                message.delete();
              })
            })
          })
          con.end();
        })

      } else {

        gb.embed = new Discord.RichEmbed()
          .setAuthor("Récompense quotidienne (" + message.member.displayName + ")", message.author.avatarURL)
          .setColor("#ff6766")
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