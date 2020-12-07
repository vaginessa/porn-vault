import axios from "axios";
import boxen from "boxen";
import cheerio from "cheerio";
import ffmpeg from "fluent-ffmpeg";
import * as fs from "fs";
import inquirer from "inquirer";
import jimp from "jimp";
import moment from "moment";
import ora from "ora";
import * as os from "os";
import readline from "readline";
import semver from "semver";
import YAML from "yaml";
import zod from "zod";
import * as nodepath from "path";

export const modules = {
  $loader: ora,
  $boxen: boxen,
  $semver: semver,
  $os: os,
  $readline: readline,
  $inquirer: inquirer,
  $yaml: YAML,
  $jimp: jimp,
  $ffmpeg: ffmpeg,
  $fs: fs,
  $path: nodepath,
  $axios: axios,
  $cheerio: cheerio,
  $moment: moment,
  $zod: zod,
};
