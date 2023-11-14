import { Html } from "@kitajs/html";
import * as CSS from "csstype";

export type Props = {
  style?: CSS.Properties;
} & JSX.ElementChildrenAttribute;

export default function BlockSection({ children, style }: Props) {
  return (
    <div
      style={{
        width: "calc(100% - 64px)",
        maxWidth: "896px",
        margin: "0 auto",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
