const { formatNumber } = require("../../contracts/helperFunctions.js");
const minecraftCommand = require("../../contracts/minecraftCommand.js");
const config = require ("../../../config.json");
class CalculateCommand extends minecraftCommand {
  constructor(minecraft) {
    super(minecraft);

    this.name = "calculate";
    this.aliases = ["calc", "math"];
    this.description = "Calculate.";
    this.isOnCooldown = false;
    this.options = [
      {
        name: "calculation",
        description: "Any kind of math equation",
        required: true,
      },
    ];
  }

  onCommand(username, message) {
    try {

      if (config.minecraft.commands.devMode) {
        if (username !== "UpFault") {
          return; 
        }
      }

      const calculation = message.replace(/[^-()\d/*+.]/g, "");
      const answer = eval(calculation);

      if (answer === Infinity) {
        return this.send(`/gc Something went wrong.. Somehow you broke it (the answer was infinity)`);
      }

      this.send(`/gc ${calculation} = ${formatNumber(answer)} (${answer.toLocaleString()})`);
    } catch (error) {
      this.send(`/gc Error: ${error}`);
    }
  }
}

module.exports = CalculateCommand;
