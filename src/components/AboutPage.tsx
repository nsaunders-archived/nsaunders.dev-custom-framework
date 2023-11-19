import { O } from "ts-toolbelt";
import Page from "./Page";
import Jumbotron from "./Jumbotron";
import BlockSection from "./BlockSection";

export type Props = {
  content: JSX.Element;
} & O.Omit<Parameters<typeof Page>[0], "children">;

export default function ({ content, ...pageProps }: Props) {
  return (
    <Page {...pageProps}>
      <main style={{ display: "flex", flexDirection: "column", gap: "2em" }}>
        <Jumbotron
          headline={
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>About</div>
              <img
                src="https://github.com/nsaunders.png"
                alt="Nick Saunders"
                style={{
                  width: "3em",
                  height: "3em",
                  borderRadius: "999px",
                  objectFit: "cover",
                }}
              />
            </div>
          }
        />
        <BlockSection style={{ lineHeight: 1.5 }}>{content}</BlockSection>
      </main>
    </Page>
  );
}
