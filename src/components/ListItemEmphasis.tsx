import * as CSS from "csstype";
import * as V from "../vars";
import hooks from "../css-hooks";

export type Props = {
  style?: CSS.Properties;
  children?: JSX.Node | JSX.Node[];
};

export default function ListItemEmphasis({ children, style }: Props) {
  return (
    <div
      style={{
        ...hooks({
          background: V.gray05,
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
