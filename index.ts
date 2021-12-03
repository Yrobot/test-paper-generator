import path from "path";
import { readFile, writeFile, mkdir } from "fs/promises";
import dayjs from "dayjs";

import { Part } from "schema";

const INPUT_PATH = path.resolve(__dirname, "./dataSource.txt");
const OUTPUT_PATH = path.resolve(__dirname, "./output");

const handleInput = async (
  lineHandler = (line: string) => {},
  path = INPUT_PATH
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
  min: 0,
  max: 0,
  list: [],
};

const handleLine = (line: string) => {
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
    } else if (line.startsWith("*NUM* ")) {
      const [min, max] = line
        .replace("*NUM* ", "")
        .split("-")
        .map((v) => parseInt(v, 10));
      temp.min = min;
      temp.max = max;
    } else {
      temp.list.push(line);
    }
  }
};

let day = dayjs("2021-12-05");
const DAY_NUMBER = Math.abs(day.diff(dayjs("2021-12-25"), "day"));

const paperGenerator = async (paperHandler = async (paper) => {}) => {
  for (let i = 0; i < DAY_NUMBER; i++) {
    let data = "";
    let totalTime = 160;
    source.forEach(({ title, time, list, min, max }) => {
      if (totalTime <= 0) return;
      data += `\n\n## ${title}\n`;
      const LEN = list.length;
      let STEP = Math.ceil(LEN / max);
      if (STEP === 1) STEP = max; // checker
      const chosen = [];
      for (let j = 0; j < max; j++) {
        if (totalTime <= 0) break;
        if (j >= min && Math.random() > 0.5) break;
        let key = (j * STEP + Math.ceil(Math.random() * STEP)) % LEN;
        while (chosen.includes(key)) {
          key = (j * STEP + Math.ceil(Math.random() * STEP)) % LEN;
        }
        chosen.push(key);
        totalTime -= time;
      }
      data += chosen
        .map((v, i) => `${i + 1}. ${list[v]} (${time}min)`)
        .join("\n");
    });
    await paperHandler(data);
  }
};

const handlePaper = async (paper: string) => {
  const name = `测试题-${day.format("YYYY-MM-DD")}`;
  const outputPath = `${OUTPUT_PATH}/${name}.txt`;
  const data = name + paper;
  await writeFile(outputPath, data);
  console.log(`生成成功：${name}`);

  // after generate
  day = day.add(1, "day");
};

export const main = async () => {
  await handleInput(handleLine);

  await mkdir(OUTPUT_PATH);
  await paperGenerator(handlePaper);
};

main().catch((err) => {
  console.error(err);
});
