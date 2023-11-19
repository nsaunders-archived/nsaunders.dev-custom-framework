import * as CSS from "csstype";
import * as V from "../vars";
import hooks from "../css-hooks";
import A from "./A";

export type Props = { style?: CSS.Properties };

export default function PageFooter({ style }: Props) {
  return (
    <footer
      style={{
        ...hooks({
          background: V.gray05,
          dark: {
            background: V.black,
          },
          padding: "1em",
          display: "flex",
          gap: "1em",
        }),
        ...style,
      }}
    >
      <A href="https://x.com/agilecoder">X</A>
      <A href="https://github.com/nsaunders">GitHub</A>
      <A href="https://linkedin.com/in/nicksaunders">LinkedIn</A>
      <div style={{ flex: 1 }} />
      <A href="https://linkedin.com/in/nicksaunders">RSS</A>
    </footer>
  );
}
