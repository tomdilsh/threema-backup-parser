import { existsSync } from "fs";
import { input, select } from "@inquirer/prompts";
import { processFolder } from "./parser.js";

export async function processOptions(args) {
  const folder = await input({
    message: "Please provide a folder containing backup data:",
  });

  if (!existsSync(folder)) {
    console.log(`The provided folder does not exist!`);
    process.exit();
  }

  const colorScheme = await select({
    message: "Which color scheme would you prefer?",
    choices: [
      {
        name: "Dark",
        value: "dark",
      },
      {
        name: "Light",
        value: "light",
      },
    ],
  });

  processFolder(folder, colorScheme);
}
