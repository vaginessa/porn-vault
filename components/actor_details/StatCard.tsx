export default function StatCard(props: { value: number | string; title: string }) {
  return (
    <div
      style={{
        borderRadius: 10,
        textAlign: "center",
        padding: 10,
        border: "1px solid #90909050",
        textTransform: "capitalize",
      }}
    >
      <div style={{ fontSize: 32, fontWeight: 500, marginBottom: 5 }}>{props.value}</div>
      <div>{props.title}</div>
    </div>
  );
}
