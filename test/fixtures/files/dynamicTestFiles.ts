import { downloadFile } from "../../../src/utils/download";

export async function downloadTestVideo(path: string): Promise<void> {
  await downloadFile(
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    path
  );
}

export async function downloadRandomImage(path: string): Promise<void> {
  await downloadFile("https://picsum.photos/seed/picsum/200/300.jpg", path);
}
