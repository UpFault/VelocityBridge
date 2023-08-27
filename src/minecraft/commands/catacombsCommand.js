const minecraftCommand = require("../../contracts/minecraftCommand.js");
const getDungeons = require("../../../API/stats/dungeons.js");
const { formatNumber, formatUsername } = require("../../contracts/helperFunctions.js");
const { getLatestProfile } = require("../../../API/functions/getLatestProfile.js");
const NodeCache = require("node-cache");
const config = require ("../../../config.json");
const cache = new NodeCache({ stdTTL: 604800 }); // 1 week in seconds

class CatacombsCommand extends minecraftCommand {
  constructor(minecraft) {
    super(minecraft);

    this.name = "catacombs";
    this.aliases = ["cata", "dungeons"];
    this.description = "Skyblock Dungeons Stats of specified user.";
    this.isOnCooldown = false;
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

      username = this.getArgs(message)[0] || username;

      let data = cache.get(username);

      if (!data) {
        data = await getLatestProfile(username);
        cache.set(username, data);
      }

      username = formatUsername(username, data.profileData?.game_mode);

      const dungeons = getDungeons(data.player, data.profile);

      if (dungeons == null) {
        throw `${username} has never played dungeons on ${data.profileData.cute_name}.`;
      }

      const completions = Object.values(dungeons.catacombs)
        .flatMap((floors) => Object.values(floors))
        .reduce((total, floor) => total + (floor.completions || 0), 0);

      const level = dungeons.catacombs.skill.levelWithProgress.toFixed(1);
      const classAvrg =
        Object.values(dungeons.classes).reduce((total, { levelWithProgress }) => total + levelWithProgress, 0) /
        Object.keys(dungeons.classes).length;

      this.send(
        `/gc ${username}'s Catacombs: ${level} | Class Average: ${classAvrg.toFixed(1)} (${
          dungeons.classes.healer.level
        }H, ${dungeons.classes.mage.level}M, ${dungeons.classes.berserk.level}B, ${dungeons.classes.archer.level}A, ${
          dungeons.classes.tank.level
        }T) | Secrets: ${formatNumber(dungeons.secrets_found ?? 0, 1)} (${(
          dungeons.secrets_found / completions
        ).toFixed(1)} S/R)`
      );
    } catch (error) {
      console.log(error);

      this.send(`/gc Error: ${error}`);
    }
  }
}

module.exports = CatacombsCommand;
