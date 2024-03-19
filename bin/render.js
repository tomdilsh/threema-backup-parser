import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import prettify from "html-prettify";
import { renderFile } from "ejs";
import { OUTPUT_FOLDER } from "./constants.js";

export function renderHTML(input_folder, messageSets) {
  const style = readFileSync("styles/style.css").toString();
  const targetFolder = `${input_folder}/${OUTPUT_FOLDER}`;

  if (!existsSync(targetFolder)) {
    mkdirSync(targetFolder);
  }

  messageSets.forEach((set) => {
    renderFile("templates/main.ejs", { set, style }, {}, (err, str) => {
      const pretty = prettify(str);
      writeFileSync(`${targetFolder}/${set.filename}.html`, pretty);
    });
  });
}
