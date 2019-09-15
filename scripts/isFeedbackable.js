exports.check = function (message) { // Vérifie si le message est éligible aux feedbacks

    let mContent = message.content.toUpperCase();
    let bl = (message.attachments.size !== 0 || mContent.includes("HTTP")) && !mContent.includes("[PARTAGE]") && !mContent.includes("[RES]") && !mContent.includes("GIPHY.COM") && !mContent.includes("TENOR.COM");
    return bl;

};

exports.checkFeedActivation = function (client, message) { // Vérifie si l'éligibilité aux feedbacks a été activée
    let messageReactions = message.reactions;
    let bl = false;
    messageReactions.forEach((r) => {
        if (r.emoji.id === client.assets.emojiIds.CHECK_TRUE) {
            if (r.users.exists("id", client.user.id)) {
                bl = true;
            }
        }
    });
    return bl;
};