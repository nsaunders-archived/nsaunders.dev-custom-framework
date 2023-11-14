import { Html } from "@kitajs/html";
import { O } from "ts-toolbelt";
import * as Pages from "../data/Pages";
import Page from "./Page";
import Jumbotron from "./Jumbotron";
import Markdown from "./Markdown";
import BlockSection from "./BlockSection";

export default async function (
  pageProps: O.Omit<Parameters<typeof Page>[0], "children">,
) {
  const { content } = await Pages.getByName("about");
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
        <BlockSection>
          <Markdown>{content}</Markdown>
        </BlockSection>
      </main>
    </Page>
  );
}
