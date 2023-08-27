const minecraftCommand = require("../../contracts/minecraftCommand.js");
const { getLatestProfile } = require("../../../API/functions/getLatestProfile.js");
const getSkills = require("../../../API/stats/skills.js");
const { formatUsername } = require("../../contracts/helperFunctions.js");
const NodeCache = require("node-cache");
const config = require ("../../../config.json");
const cache = new NodeCache({ stdTTL: 604800 }); // 1 week in seconds

class SkillsCommand extends minecraftCommand {
  constructor(minecraft) {
    super(minecraft);

    this.name = "skills";
    this.aliases = ["skill", "sa"];
    this.description = "Skills and Skill Average of specified user.";
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

      username = formatUsername(username, data.profileData.cute_name);

      const profile = getSkills(data.profile);

      const skillAverage = (
        Object.keys(profile)
          .filter((skill) => !["runecrafting", "social"].includes(skill))
          .map((skill) => profile[skill].level || 0)
          .reduce((a, b) => a + b, 0) /
        (Object.keys(profile).length - 2)
      ).toFixed(2);

      this.send(
        `/gc Skill Average: ${skillAverage ?? 0} | Farming: ${Math.floor(
          profile.farming.levelWithProgress ?? 0
        )} | Mining: ${Math.floor(profile.mining.levelWithProgress ?? 0)} | Combat: ${Math.floor(
          profile.combat.levelWithProgress ?? 0
        )} | Enchanting: ${Math.floor(profile.enchanting.levelWithProgress ?? 0)} | Fishing: ${Math.floor(
          profile.fishing.levelWithProgress ?? 0
        )} | Foraging: ${Math.floor(profile.foraging.levelWithProgress ?? 0)} | Alchemy: ${Math.floor(
          profile.alchemy.levelWithProgress ?? 0
        )} | Taming: ${Math.floor(profile.taming.levelWithProgress ?? 0)} | Carpentry: ${Math.floor(
          profile.carpentry.levelWithProgress ?? 0
        )}`
      );
    } catch (error) {
      this.send(`Error: ${error}}`);
    }
  }
}

module.exports = SkillsCommand;
