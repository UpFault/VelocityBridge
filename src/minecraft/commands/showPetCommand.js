const { getRarityColor, formatUsername } = require("../../contracts/helperFunctions.js");
const minecraftCommand = require("../../contracts/minecraftCommand.js");
const { renderLore } = require("../../contracts/renderItem.js");
const { getLatestProfile } = require("../../../API/functions/getLatestProfile.js");
const getPets = require("../../../API/stats/pets.js");
const { uploadImage } = require("../../contracts/API/imgurAPI.js");
const NodeCache = require("node-cache");

const cache = new NodeCache({ stdTTL: 604800 }); // 1 week in seconds

class RenderCommand extends minecraftCommand {
  constructor(minecraft) {
    super(minecraft);

    this.name = "pet";
    this.aliases = ["pets"];
    this.description = "Renders active pet of specified user.";
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

      const profile = getPets(data.profile);

      const pet = profile.pets.find((pet) => pet.active === true);

      if (pet === undefined) {
        return this.send(`/gc ${username} does not have a pet equipped.`);
      }

      const renderedItem = await renderLore(
        `§7[Lvl ${pet.level}] §${getRarityColor(pet.tier)}${pet.display_name}`,
        pet.lore
      );

      const upload = await uploadImage(renderedItem);

      return this.send(`/gc ${username}'s Active Pet: ${upload.data.link ?? "Something went Wrong.."}`);
    } catch (error) {
      console.log(error);
      this.send(`/gc Error: ${error}`);
    }
  }
}

module.exports = RenderCommand;
