const Discord = require("discord.js")

var mysql = require("mysql")

exports.run = (client, message, args) => {

  const query = `SELECT * FROM users WHERE user_id = ${message.author.id}`;
  var results;

  console.log(client.config.mysqlUser + client.config.mysqlPass);
  
  var con = mysql.createConnection({
    host: "localhost",
    user: "ggg",
    password: "ggg",
    database: "strad"
  });

  con.connect(query, (err) => {
    results = result[0];
  });

  console.log(con);
  
  const stradEmoji = "<:strad:544057514589683723>";

  const embedMoney = new Discord.RichEmbed()
    .setAuthor(message.author.tag, message.author.avatarURL)
    .setThumbnail(message.author.avatarURL)
    .addField("Valeur du compte", `${results["money"]} ${stradEmoji}`, true)
    .addField("Nombre de Créas", `${results["creas_amount"]}`, true)
    .addField("ID du propriétaire", message.author.id, true)
    .addField("Rang artistique", "unknown", true)
    .setFooter("Strad rank")
    .setColor(message.member.displayColor);

    client.channels.get('413678978990080010').send(embedMoney);
    message.delete();
};