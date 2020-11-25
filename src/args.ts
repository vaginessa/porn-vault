import yargs from "yargs";

const argv = yargs
  .boolean("process-queue")
  .boolean("skip-compaction")
  .boolean("update-izzy")
  .boolean("generate-image-thumbnails")
  .number("index-slice-size")
  .boolean("reindex")
  .boolean("reset-izzy").argv;

export default argv;
