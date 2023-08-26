const minecraftCommand = require("../../contracts/minecraftCommand.js");
const hypixel = require("../../contracts/API/HypixelRebornAPI.js");
const { getUUID } = require("../../contracts/API/PlayerDBAPI.js");
const NodeCache = require("node-cache");

const cache = new NodeCache({ stdTTL: 604800 }); // 1 week in seconds
const commandCooldowns = new Set();

class GuildExperienceCommand extends minecraftCommand {
  constructor(minecraft) {
    super(minecraft);

    this.name = "guildexp";
    this.aliases = ["gexp"];
    this.description = "Guilds experience of specified user.";
    this.options = [
      {
        name: "username",
        description: "Minecraft username",
        required: false,
      },
    ];
  }

  async onCommand(username, message) {
    try {
      if (commandCooldowns.has(username)) {
        this.send(`/gc Please wait a bit before using this command again.`);
        return;
      }

      commandCooldowns.add(username);
      setTimeout(() => {
        commandCooldowns.delete(username);
      }, 10000); // 10 seconds in milliseconds

      username = this.getArgs(message)[0] || username;

      let [uuid, guild] = cache.get(username) || [];

      if (!uuid || !guild) {
        [uuid, guild] = await Promise.all([getUUID(username), hypixel.getGuild("player", username)]);
        cache.set(username, [uuid, guild]);
      }

      const player = guild.members.find((member) => member.uuid == uuid);

      if (player === undefined) {
        throw "Player is not in the Guild.";
      }

      this.send(`/gc ${username}'s Weekly Guild Experience: ${player.weeklyExperience.toLocaleString()}.`);
    } catch (error) {
      this.send(`/gc ${error.toString().replace("[hypixel-api-reborn] ", "")}`);
    }
  }
}

module.exports = GuildExperienceCommand;
