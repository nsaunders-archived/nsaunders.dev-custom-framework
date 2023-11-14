import { Html } from "@kitajs/html";
import * as CSS from "csstype";
import * as V from "../vars";
import hooks from "../css-hooks";

export type Props = {
  style?: CSS.Properties;
} & JSX.ElementChildrenAttribute;

export default function ListItemEmphasis({ children, style }: Props) {
  return (
    <div
      style={{
        ...hooks({
          background: V.gray10,
          dark: { background: V.gray80 },
          padding: "2em",
        }),
        ...style,
      }}
    >
      {children}
    </div>
  );
}
