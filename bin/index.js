import { existsSync } from "fs";
import { program } from "commander";

import { processFolder } from "./parser.js";

// program
//   .usage("[options] <file>")
//   .option("-v, --version", "show version", ver, "")
//   .option("-p, --port <port>", "use custom port")
//   .option("-f, --flag", "boolean flag", false)
//   .action((file, options) => {
//     console.log("file name: ", file);
//   })
//   .parse(process.argv);

function runParser(folder) {
  if (existsSync(folder)) {
    processFolder(folder);
  }
}

runParser("threema-backup");
