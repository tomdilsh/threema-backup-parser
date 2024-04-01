import { existsSync } from "fs";
import { input, select } from "@inquirer/prompts";
import { processFolder } from "./parser";
import { COLOR_SCHEME } from "./constants";

export async function processOptions() {
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
        value: COLOR_SCHEME.Dark,
      },
      {
        name: "Light",
        value: COLOR_SCHEME.Light,
      },
    ],
  });

  processFolder(folder, colorScheme);
}
