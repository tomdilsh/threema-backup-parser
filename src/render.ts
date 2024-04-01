import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import * as prettier from "prettier";
import { compile } from "sass";
import { renderFile } from "ejs";
import { COLOR_SCHEME, OUTPUT_FOLDER } from "./constants";
import { ThreadSet } from "./types";

export function renderHTML(
  inputFolder: string,
  entrySets: ThreadSet[],
  colorScheme: COLOR_SCHEME
) {
  const style = compile(`styles/${colorScheme}.scss`).css;
  const script = readFileSync("scripts/browser.js").toString();
  const targetFolder = `${inputFolder}/${OUTPUT_FOLDER}`;

  if (!existsSync(targetFolder)) {
    mkdirSync(targetFolder);
  }

  entrySets.forEach((set) => {
    renderFile(
      "templates/main.ejs",
      { set, style, script },
      {},
      async (err, str) => {
        const pretty = await prettier.format(str, { parser: "html" });
        writeFileSync(`${targetFolder}/${set.filename}.html`, pretty);
      }
    );
  });

  console.log(
    `Finished! ${entrySets.length} files were written to "${targetFolder}"`
  );
}
