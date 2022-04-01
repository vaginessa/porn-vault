export default function ActorPage() {
  const heroSrc = "http://localhost:3000/api/media/image/im_kktt9twr17R44dz4?password=null";

  return (
    <div>
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", left: 10, top: 10 }}>BACK ICON</div>
        <img width="100%" style={{ aspectRatio: String(2.75) }} src={heroSrc} />
      </div>
      <div style={{ display: "flex" }}>
        <div style={{ position: "relative", marginTop: -86, marginLeft: 20 }}>
          <img
            style={{
              boxShadow: "0px 10px 15px -3px rgba(0,0,0,0.1)",
              borderRadius: "50%",
              border: "4px solid grey",
            }}
            width="160"
            src="http://localhost:3000/api/media/image/im_kkttbgpelQW4vcNB?password=null"
          />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: "bold" }}>Jill Kassidy</div>
            <div title="Born on XXX" style={{ fontSize: 14, opacity: 0.8 }}>
              (26 years old)
            </div>
          </div>
        </div>
        <div style={{ flexGrow: 1, paddingLeft: 10, paddingRight: 10 }}>
          <div style={{ flexGrow: 1, display: "flex" }}>
            <div>Jill Kassidy</div>
            <div style={{ flexGrow: 1 }}></div>
            LIKE
          </div>
          <div style={{ flexGrow: 1, display: "flex" }}>
            <div>Jill Kassidy</div>
            <div style={{ flexGrow: 1 }}></div>
            LIKE
          </div>
        </div>
      </div>
    </div>
  );
}
