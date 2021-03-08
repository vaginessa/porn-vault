import { downloadFile } from "../../../src/utils/download";

export const TEST_VIDEOS = {
  MP4: {
    url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    metadata: {
      dimensions: {
        width: 1280,
        height: 720,
      },
      duration: 15.020833,
      fps: 24,
      size: 2252313,
      audioCodec: "aac",
      container: "mov,mp4,m4a,3gp,3g2,mj2",
      videoCodec: "h264",
    },
  },
};

export async function downloadRandomImage(path: string): Promise<void> {
  await downloadFile("https://picsum.photos/seed/picsum/200/300.jpg", path);
}
