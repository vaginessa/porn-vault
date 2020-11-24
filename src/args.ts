import yargs from "yargs";

const argv = yargs
  .boolean("process-queue")
  .boolean("commit-import")
  .boolean("ignore-integrity")
  .boolean("skip-compaction")
  .boolean("update-izzy")
  .boolean("generate-image-thumbnails")
  .number("index-slice-size")
  .boolean("reindex").argv;

export default argv;
