import * as V from "../vars";
import hooks from "../css-hooks";
import BlockSection from "./BlockSection";

export type Props = {
  headline: JSX.ElementChildrenAttribute["children"];
} & JSX.ElementChildrenAttribute;

export default function ({ headline, children }: Props) {
  return (
    <section
      style={hooks({
        background: V.gray10,
        fontSize: "1.5em",
        padding: "2em",
        dark: {
          background: V.gray80,
        },
      })}
    >
      <BlockSection>
        <div
          style={hooks({
            background: V.white,
            padding: "1em",
            margin: "-1em",
            display: "flex",
            flexDirection: "column",
            gap: "0.5em",
            dark: {
              background: "transparent",
              padding: 0,
              margin: 0,
            },
          })}
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
        </div>
      </BlockSection>
    </section>
  );
}
