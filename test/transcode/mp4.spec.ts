import { before, Suite } from "mocha";
import { FFProbeAudioCodecs, FFProbeVideoCodecs } from "../../src/ffmpeg/ffprobe";
import Scene from "../../src/types/scene";
import { expect } from "chai";
import { startTestServer, stopTestServer } from "../testServer";
import { MP4Transcoder } from "../../src/transcode/mp4";

describe("transcoder", () => {
  describe("mp4", function (this: Suite) {
    before(async () => {
      await startTestServer.call(this);
    });

    after(() => {
      stopTestServer();
    });

    it("copies the video stream", () => {
      const scene = new Scene("test");
      scene.meta.videoCodec = FFProbeVideoCodecs.H264;

      const { outputOptions } = new MP4Transcoder(scene).getTranscodeOptions();
      expect(outputOptions).to.include("-c:v copy");
    });

    it("transcodes the video stream", () => {
      const scene = new Scene("test") as Scene & { path: string };
      scene.meta.videoCodec = "unknown" as FFProbeVideoCodecs;

      const { outputOptions } = new MP4Transcoder(scene).getTranscodeOptions();
      expect(outputOptions).to.include("-c:v libx264");
    });

    it("copies the audio stream", () => {
      const scene = new Scene("test") as Scene & { path: string };
      scene.meta.audioCodec = FFProbeAudioCodecs.AAC;

      const { outputOptions } = new MP4Transcoder(scene).getTranscodeOptions();
      expect(outputOptions).to.include("-c:a copy");
      expect(outputOptions).to.not.include("-c:a aac");
    });

    it("does not copy the audio stream", () => {
      const scene = new Scene("test") as Scene & { path: string };
      scene.meta.audioCodec = "unknown" as FFProbeAudioCodecs;

      const { outputOptions } = new MP4Transcoder(scene).getTranscodeOptions();
      expect(outputOptions).to.include("-c:a aac");
    });

    it("validates requirements", () => {
      const scene = new Scene("test");
      scene.meta.videoCodec = FFProbeVideoCodecs.H264;

      expect(new MP4Transcoder(scene).validateRequirements()).to.be.true;
    });

    it("validates requirements 2", () => {
      const scene = new Scene("test");
      scene.meta.videoCodec = "unknown" as FFProbeVideoCodecs;

      expect(new MP4Transcoder(scene).validateRequirements()).to.be.true;
    });

    it("adds bitrate options", () => {
      const scene = new Scene("test");
      scene.meta.bitrate = 1000;

      const { outputOptions } = new MP4Transcoder(scene).getTranscodeOptions();
      expect(outputOptions.some((opt) => opt.includes("-maxrate"))).to.be.true;
    });

    it("does not add bitrate options", () => {
      const scene = new Scene("test");
      scene.meta.bitrate = null;

      const { outputOptions } = new MP4Transcoder(scene).getTranscodeOptions();
      expect(outputOptions.some((opt) => opt.includes("-maxrate"))).to.be.false;
    });
  });
});
