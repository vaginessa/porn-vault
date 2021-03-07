import { downloadFile } from "../../../src/utils/download";

export async function downloadTestVideo(path: string): Promise<void> {
  await downloadFile(
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    path
  );
}

export const testVideoMeta = {
  dimensions: {
    width: 1280,
    height: 720,
  },
  duration: 15.020833,
  fps: 24,
  size: 2252313,
};

export async function downloadRandomImage(path: string): Promise<void> {
  await downloadFile("https://picsum.photos/seed/picsum/200/300.jpg", path);
}
