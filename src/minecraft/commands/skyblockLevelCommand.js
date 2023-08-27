const minecraftCommand = require("../../contracts/minecraftCommand.js");
const { formatUsername } = require("../../contracts/helperFunctions.js");
const { getLatestProfile } = require("../../../API/functions/getLatestProfile.js");
const NodeCache = require("node-cache");

const cache = new NodeCache({ stdTTL: 604800 }); // 1 week in seconds

class CatacombsCommand extends minecraftCommand {
  constructor(minecraft) {
    super(minecraft);

    this.name = "level";
    this.aliases = ["lvl"];
    this.description = "Skyblock Level of specified user.";
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

      username = formatUsername(username, data.profileData?.game_mode);

      const experience = data.profile.leveling?.experience ?? 0;
      this.send(`/gc ${username}'s Skyblock Level: ${experience ? experience / 100 : 0}`);
    } catch (error) {
      console.log(error);

      this.send(`/gc Error: ${error}`);
    }
  }
}

module.exports = CatacombsCommand;
