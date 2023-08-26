const minecraftCommand = require("../../contracts/minecraftCommand.js");
const { getLatestProfile } = require("../../../API/functions/getLatestProfile.js");
const getWeight = require("../../../API/stats/weight.js");
const { formatUsername, formatNumber } = require("../../contracts/helperFunctions.js");
const NodeCache = require("node-cache");

const cache = new NodeCache({ stdTTL: 604800 }); // 1 week in seconds

class StatsCommand extends minecraftCommand {
  constructor(minecraft) {
    super(minecraft);

    this.name = "weight";
    this.aliases = ["w"];
    this.description = "Skyblock Weight of specified user.";
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
      username = this.getArgs(message)[0] || username;

      let data = cache.get(username);

      if (!data) {
        data = await getLatestProfile(username);
        cache.set(username, data);
      }

      username = formatUsername(data.profileData?.displayname || username);

      const profile = getWeight(data.profile, data.uuid);

      const senitherW = `Senither Weight: ${formatNumber(profile.senither.total)} | Skills: ${formatNumber(
        Object.keys(profile.senither.skills)
          .map((skill) => profile.senither.skills[skill].total)
          .reduce((a, b) => a + b, 0)
      )} | Dungeons: ${formatNumber(profile.senither.dungeons.total)}`;
      this.send(`/gc ${username}'s ${senitherW}`);
    } catch (error) {
      this.send(`/gc Error: ${error}`);
    }
  }
}

module.exports = StatsCommand;
