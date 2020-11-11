import { downloadFile } from "../../../src/utils/download";

export async function downloadTestVideo(path: string) {
  await downloadFile(
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    path
  );
}
