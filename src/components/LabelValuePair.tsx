import { Html } from "@kitajs/html";
import * as CSS from "csstype";

export type Props = {
  label: JSX.ElementChildrenAttribute["children"];
  value: JSX.ElementChildrenAttribute["children"];
  style?: CSS.Properties;
};

export default function LabelValuePair({ label, value, style }: Props) {
  return (
    <div style={{ display: "inline-flex", gap: "8px", ...style }}>
      <div style={{ display: "grid", placeItems: "center" }}>{label}</div>
      <div style={{ display: "grid", placeItems: "center" }}>{value}</div>
    </div>
  );
}
