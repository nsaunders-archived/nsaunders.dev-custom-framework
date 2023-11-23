import * as V from "varsace";
import hooks from "../css-hooks";
import BlockSection from "./BlockSection";

export type Props = {
  headline?: JSX.Node;
  children?: JSX.Nodes;
};

export default function ({ headline, children }: Props) {
  return (
    <section
      style={hooks({
        background: V.gray05,
        fontSize: "1.5em",
        padding: "1em 0 2em 0",
        dark: {
          background: V.gray80,
        },
        display: "flex",
      })}
    >
      <BlockSection
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1em",
        }}
      >
        <h1
          style={hooks({
            color: V.purple50,
            dark: { color: V.orange20 },
            fontSize: "1.6em",
            fontWeight: 400,
            margin: 0,
          })}
        >
          {headline}
        </h1>
        {children}
      </BlockSection>
    </section>
  );
}
