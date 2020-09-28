import yargs from "yargs";

const argv = yargs
  .boolean("process-queue")
  .boolean("commit-import")
  .boolean("ignore-integrity")
  .boolean("skip-compaction")
  .boolean("update-izzy")
  .boolean("update-gianna")
  .boolean("generate-image-thumbnails")
  .number("index-slice-size").argv;

export default argv;
