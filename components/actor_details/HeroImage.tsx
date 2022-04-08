type Props = {
  imageId?: string;
};

export default function HeroImage({ imageId }: Props) {
  return (
    <>
      {imageId && (
        <div style={{ position: "relative" }}>
          <img
            width="100%"
            style={{ aspectRatio: String(2.75) }}
            src={`/api/media/image/${imageId}?password=null`}
          />
        </div>
      )}
    </>
  );
}
