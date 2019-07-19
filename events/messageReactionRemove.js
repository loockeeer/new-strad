module.exports = (client, messageReaction, user) => {

    if (messageReaction.message.channel.type !== "text") return;

    if (client.config.mtnMode == "true") {
        return;
    }

    if (messageReaction.message.id === "570618282177069076") { // Distributeur de rôles
        var emojiName = messageReaction.emoji.name;
        var stradivarius = client.guilds.find(g => g.id === "412369732679893004");
        var member = stradivarius.members.find(m => m.id === user.id);

        switch (emojiName) {
            case "📝":
                member.removeRole(stradivarius.roles.find(r => r.name === "Graphiste"));
                break;
            case "🎞":
                member.removeRole(stradivarius.roles.find(r => r.name === "Vidéaste"));
                break;
            case "🎨":
                member.removeRole(stradivarius.roles.find(r => r.name === "Dessinateur/trice"));
                break;
            case "📸":
                member.removeRole(stradivarius.roles.find(r => r.name === "Photographe"));
                break;
            case "💻":
                member.removeRole(stradivarius.roles.find(r => r.name === "Développeur/peuse"));
                break;
            case "🎹":
                member.removeRole(stradivarius.roles.find(r => r.name === "Audiophile"));
                break;
            default:
                return;
        }
    }

    if (messageReaction.message.id === "601739344163897344") { // Distributeur de rôles
        function removeSeparator(member) {
            if (!member.roles.find(r => r.name === rolePrefix + "News")
                && !member.roles.find(r => r.name === rolePrefix + "Events")
                && !member.roles.find(r => r.name === rolePrefix + "Streams")) {
                member.removeRole(stradivarius.roles.find(r => r.name === "------------ Notifications ------------"));
            }
        }
        var emojiName = messageReaction.emoji.name;
        var stradivarius = client.guilds.find(g => g.id === "412369732679893004");
        var member = stradivarius.members.find(m => m.id === user.id);
        var rolePrefix = "Notif's - ";

        switch (emojiName) {
            case "🔔":
                member.removeRole(stradivarius.roles.find(r => r.name === rolePrefix + "News"))
                    .then(m => {
                        removeSeparator(m);
                    });
                break;
            case "🎉":
                member.removeRole(stradivarius.roles.find(r => r.name === rolePrefix + "Events"))
                    .then(m => {
                        removeSeparator(m);
                    });
                break;
            case "📡":
                member.removeRole(stradivarius.roles.find(r => r.name === rolePrefix + "Streams"))
                    .then(m => {
                        removeSeparator(m);
                    });
                break;
            default:
                return;
        }
    }

};