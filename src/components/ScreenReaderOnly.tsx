import * as CSS from "csstype";

export type Props = {
  style?: CSS.Properties;
  children?: JSX.Node | JSX.Node[];
};

export default function ScreenReaderOnly({ style, children }: Props) {
  return (
    <div
      style={{
        position: "absolute",
        width: "1px",
        height: "1px",
        padding: 0,
        margin: "-1px",
        overflow: "hidden",
        clip: "rect(0, 0, 0, 0)",
        border: 0,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
