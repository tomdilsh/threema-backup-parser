import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import * as prettier from "prettier";
import { renderFile } from "ejs";
import { OUTPUT_FOLDER } from "./constants.js";

export function renderHTML(input_folder, messageSets) {
  const style = readFileSync("styles/style.css").toString();
  const targetFolder = `${input_folder}/${OUTPUT_FOLDER}`;

  if (!existsSync(targetFolder)) {
    mkdirSync(targetFolder);
  }

  messageSets.forEach((set) => {
    renderFile("templates/main.ejs", { set, style }, {}, async (err, str) => {
      const pretty = await prettier.format(str, { parser: "html" });
      writeFileSync(`${targetFolder}/${set.filename}.html`, pretty);
    });
  });

  console.log(
    `Finished! ${messageSets.length} files were written to "${targetFolder}"`
  );
}
