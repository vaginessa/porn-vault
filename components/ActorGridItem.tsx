import HeartIcon from "@mui/icons-material/Favorite";

type Props = {
  name: string;
  thumbnail?: string;
  favorite?: boolean;
};

function thumbnailUrl(thumbnail: string) {
  return `/api/media/image/${thumbnail}/thumbnail?password=xxx`;
}

export default function ActorCard({ name, thumbnail, favorite }: Props) {
  return (
    <div style={{ position: "relative" }}>
      <img
        style={{
          borderRadius: 8,
        }}
        width="100%"
        src={thumbnailUrl(thumbnail || "null")}
      />
      {favorite && (
        <div
          style={{
            position: "absolute",
            right: 4,
            top: 4,
          }}
        >
          <HeartIcon color="error" />
        </div>
      )}
      <div
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: "white",
          background: "#000000bb",
          textAlign: "center",
          position: "absolute",
          bottom: 10,
          left: 0,
          right: 0,
          margin: "0 5px",
          borderRadius: 4,
          padding: "4px",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {name}
      </div>
    </div>
  );
}
