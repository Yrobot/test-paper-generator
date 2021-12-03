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
  key: "",
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
    } else if (line.startsWith("*KEY* ")) {
      temp.key = line.replace("*KEY* ", "");
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
const DAY_NUMBER = Math.abs(day.diff(dayjs("2021-12-18"), "day"));

let transData: {
  time: number;
  key: string;
  title: string;
  content: string;
}[] = [];

const remove = (i = 0, arr = transData) => {
  arr.splice(i, 1);
};

const paperGenerator = async (paperHandler = async (paper) => {}) => {
  for (let i = 0; i < DAY_NUMBER; i++) {
    let data = "";
    let totalTime = 160;
    let i = 0;
    const list = [];

    const keys = [];

    while (transData.length > 0 && totalTime > 0) {
      const LEN = transData.length;
      const index = Math.floor(Math.random() * LEN);
      const item = transData[index];
      list.push(item);
      totalTime -= item.time;
      if (!keys.includes(item.key)) keys.push(item.key);
      remove(index);
    }

    keys.forEach((_key) => {
      const arr = list.filter(({ key }) => key === _key);
      const title = arr[0].title;
      data += `\n\n## ${title}\n`;
      data += arr
        .map(({ content, time }, i) => `${i + 1}. ${content} (${time}min)`)
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

  source.forEach(({ title, key, time, list }) => {
    list.map((content) => {
      transData.push({ time, key, title, content });
    });
  });

  await mkdir(OUTPUT_PATH);
  await paperGenerator(handlePaper);

  console.log(`题库剩余：${transData.length}`);

  // console.log(
  //   source.map(({ list, title }) => ({
  //     title,
  //     num: list.length,
  //   }))
  // );
};

main().catch((err) => {
  console.error(err);
});
