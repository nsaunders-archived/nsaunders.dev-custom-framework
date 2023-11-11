import { O } from "ts-toolbelt";
import * as V from "../vars";
import * as Posts from "../data/Posts";
import Page from "./Page";
import PostListItem from "./PostListItem";
import hooks from "../css-hooks";
import ListItemEmphasis from "./ListItemEmphasis";
import ListLayout from "./ListLayout";
import BlockSection from "./BlockSection";

export default async function (
  pageProps: O.Omit<Parameters<typeof Page>[0], "children">,
) {
  const posts = (await Posts.list()).sort((a, b) =>
    a.published > b.published ? -1 : a.published < b.published ? 1 : 0,
  );
  return (
    <Page {...pageProps}>
      <main
        style={{
          padding: "4rem",
        }}
      >
        <BlockSection
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "2em",
          }}
        >
          {posts.map((post, i) => {
            const content = <PostListItem>{post}</PostListItem>;
            return (
              <>
                {i ? (
                  <>
                    <hr
                      style={hooks({
                        border: 0,
                        background: V.gray20,
                        dark: {
                          background: V.gray80,
                        },
                        width: "100%",
                        height: "1px",
                      })}
                    />
                    {content}
                  </>
                ) : (
                  <ListLayout title="Latest post">
                    <ListItemEmphasis>{content}</ListItemEmphasis>
                  </ListLayout>
                )}
              </>
            );
          })}
        </BlockSection>
      </main>
    </Page>
  );
}
