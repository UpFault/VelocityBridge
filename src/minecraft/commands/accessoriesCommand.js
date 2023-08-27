const { getLatestProfile } = require("../../../API/functions/getLatestProfile.js");
const { formatUsername } = require("../../contracts/helperFunctions.js");
const minecraftCommand = require("../../contracts/minecraftCommand.js");
const getTalismans = require("../../../API/stats/talismans.js");
const NodeCache = require("node-cache");
const config = require ("../../../config.json");
const cache = new NodeCache({ stdTTL: 604800 }); // 1 week in seconds

class AccessoriesCommand extends minecraftCommand {
  constructor(minecraft) {
    super(minecraft);

    this.name = "accessories";
    this.aliases = ["acc", "talismans", "talisman"];
    this.description = "Accessories of specified user.";
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

      const data = await getLatestProfile(username);

      username = formatUsername(username, data.profileData?.game_mode);

      const talismans = cache.get(username);

      if (!talismans) {
        const talismansData = await getTalismans(data.profile);
        cache.set(username, talismansData);
      }

      const rarities = Object.keys(talismans)
        .map((key) => {
          if (["recombed", "enriched", "total"].includes(key)) return;

          return [`${talismans[key]}${key[0].toUpperCase()}`];
        })
        .filter((x) => x)
        .join(", ");

      this.send(
        `/gc ${username}'s Accessories: ${talismans.total} (${rarities}), Recombed: ${talismans.recombed}, Enriched: ${talismans.enriched}`
      );
    } catch (error) {
      this.send(`/gc Error: ${error}`);
    }
  }
}

module.exports = AccessoriesCommand;
