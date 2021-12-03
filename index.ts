import path from "path";
import { readFile } from "fs/promises";

import { Part } from "schema";

const inputPath = path.resolve(__dirname, "./dataSource.txt");

const handleInput = async (
  lineHandler = (line: string) => {},
  path = inputPath
) => {
  const data = await readFile(path, {
    encoding: "utf-8",
  });
  data.split("\n").map(lineHandler);
};

// let subTitle: string = "";
const source: Part[] = [];
let temp: Part = {
  title: "",
  time: 0,
  list: [],
};

const handler = (line: string) => {
  if (line) {
    if (line.startsWith("// ")) return;
    if (line.startsWith("# ")) {
      if (temp.list.length > 0) source.push(temp);
      temp = { ...temp, list: [] };
      temp.title = line.replace("# ", "");
    } else if (line.startsWith("## ")) {
      // subTitle = line.replace("## ", "");
    } else if (line.startsWith("*TIME* ")) {
      temp.time = parseFloat(line.replace("*TIME* ", ""));
    } else {
      temp.list.push(line);
    }
  }
};

export const main = async () => {
  await handleInput(handler);
  console.log(
    source.map(({ list, ...res }) => ({ ...res, list: list.slice(0, 5) }))
  );
};

main().catch((err) => {
  console.error(err);
});
