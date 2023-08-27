const minecraftCommand = require("../../contracts/minecraftCommand.js");
const hypixel = require("../../contracts/API/HypixelRebornAPI.js");
const { capitalize, formatNumber } = require("../../contracts/helperFunctions.js");
const NodeCache = require("node-cache");
const config = require ("../../../config.json");
const cache = new NodeCache({ stdTTL: 604800 }); // 1 week in seconds

class GuildInformationCommand extends minecraftCommand {
  constructor(minecraft) {
    super(minecraft);

    this.name = "guild";
    this.aliases = ["g"];
    this.description = "View information of a guild";
    this.isOnCooldown = false;
    this.options = [
      {
        name: "guild",
        description: "Guild name",
        required: true,
      },
    ];
  }

  async onCommand(username, message) {
    try {

      if (config.minecraft.commands.devMode) {
        if (username !== "UpFault") {
          return; 
        }
      }

      if (this.isOnCooldown) {
        return this.send(`/gc ${username} Command is on cooldown`);
      }

      this.isOnCooldown = true;

      setTimeout(() => {
        this.isOnCooldown = false;
      }, 30000);

      const guildName = this.getArgs(message)
        .map((arg) => capitalize(arg))
        .join(" ");

      let guild = cache.get(guildName);

      if (!guild) {
        guild = await hypixel.getGuild("name", guildName);
        cache.set(guildName, guild);
      }

      this.send(
        `/gc Guild ${guildName} | Tag: [${guild.tag}] | Members: ${guild.members.length} | Level: ${
          guild.level
        } | Weekly GEXP: ${formatNumber(guild.totalWeeklyGexp)}`
      );
    } catch (error) {
      this.send(`/gc ${error.toString().replace("[hypixel-api-reborn] ", "")}`);
    }
  }
}

module.exports = GuildInformationCommand;
