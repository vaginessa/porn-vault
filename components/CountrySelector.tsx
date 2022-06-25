import defaultCountries from "../src/data/countries";

type Props = {
  value: string;
  onChange: (s: string) => void;
  relevancy?: number;
  style?: React.CSSProperties;
};

export function CountrySelector({ style, value, onChange, relevancy: minRelevancy }: Props) {
  return (
    <select style={style} value={value} onChange={(ev) => onChange(ev.target.value)}>
      <option value={""}>-</option>
      {defaultCountries
        .filter(({ relevancy }) => relevancy > (minRelevancy ?? 1))
        .map((c) => (
          <option key={c.alpha2} value={c.alpha2}>
            {c.alias || c.name}
          </option>
        ))}
    </select>
  );
}
