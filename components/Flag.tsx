type Props = {
  code: string;
  size?: number;
};

const ratio = 3 / 4;

export default function Flag({ code, size }: Props) {
  const w = size || 32;
  const h = w * ratio;
  return <img width={w} height={h} src={`/assets/flags/${code.toLowerCase()}.svg`} />;
}
