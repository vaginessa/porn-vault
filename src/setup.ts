import { defaultConfig } from "./config/index";
import inquirer from "inquirer";

export default async () => {

  const answers = await inquirer
    .prompt([
      {
        type: "checkbox",
        name: "ffmpeg",
        message: "Download FFMPEG binaries?",
        choices: ["Yes", "No"]
      }
    ]); 

  return defaultConfig;
}