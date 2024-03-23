import { existsSync } from "fs";
import { processFolder } from "./parser.js";

// options:
// dark mode?
// swap sender?

export function processCli(args) {
  if (args.length >= 1) {
    runParser(args[0]);
  } else {
    console.log("Please provide a folder containing backup data");
  }
}

function runParser(folder) {
  if (existsSync(folder)) {
    processFolder(folder);
  } else {
    console.log(`Folder "${folder}" doesn't exist`);
  }
}
