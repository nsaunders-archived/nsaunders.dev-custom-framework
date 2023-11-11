import { O } from "ts-toolbelt";
import * as V from "../vars";
import Page from "./Page";
import Jumbotron from "./Jumbotron";
import BlockSection from "./BlockSection";
import ListLayout from "./ListLayout";
import ListItemEmphasis from "./ListItemEmphasis";
import PostListItem from "./PostListItem";
import hooks from "../css-hooks";
import ProjectListItem from "./ProjectListItem";
import A from "./A";
import * as Posts from "../data/Posts";
import * as Projects from "../data/Projects";

export default async function (
  pageProps: O.Omit<Parameters<typeof Page>[0], "children">,
) {
  const [latestPost] = (await Posts.list()).sort((a, b) =>
    a.published > b.published ? -1 : a.published < b.published ? 1 : 0,
  );
  const featuredProject = await Projects.getFeatured();
  return (
    <Page {...pageProps}>
      <main style={{ display: "flex", flexDirection: "column", gap: "4em" }}>
        <Jumbotron headline="Hi there, I'm Nick.">
          <p style={{ marginBlock: 0 }}>
            I&apos;m an experienced software engineer focused on React,
            TypeScript, user experience, and design systems. I also dabble in
            functional programming.
          </p>
        </Jumbotron>
        <BlockSection
          style={{ display: "flex", flexDirection: "column", gap: "2em" }}
        >
          {(
            [
              latestPost && [
                <section>
                  <ListLayout title="Latest post">
                    <ListItemEmphasis>
                      <PostListItem>{latestPost}</PostListItem>
                    </ListItemEmphasis>
                  </ListLayout>
                </section>,
                "/posts",
              ],
              featuredProject && [
                <section>
                  <ListLayout title="Featured project">
                    <ListItemEmphasis>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(32ch, 1fr))",
                          gap: "2em",
                        }}
                      >
                        <ListItemEmphasis
                          style={hooks({
                            background: V.white,
                            dark: { background: V.gray70 },
                          })}
                        >
                          <ProjectListItem>{featuredProject}</ProjectListItem>
                        </ListItemEmphasis>
                        <div style={{ lineHeight: 1.5 }}>
                          {featuredProject.story}
                        </div>
                      </div>
                    </ListItemEmphasis>
                  </ListLayout>
                </section>,
                "/projects",
              ],
            ] as ([JSX.Element, string] | false)[]
          ).flatMap((item, i) => {
            if (!item) {
              return [];
            }
            const [contentInner, viewMore] = item;
            const content = (
              <div
                style={{ display: "flex", flexDirection: "column", gap: "1em" }}
              >
                {contentInner}
                <A href={viewMore}>View more&hellip;</A>
              </div>
            );
            return (
              <>
                {i
                  ? [
                      <hr
                        style={hooks({
                          border: 0,
                          width: "100%",
                          height: "1px",
                          background: V.gray20,
                          dark: {
                            background: V.gray80,
                          },
                        })}
                      />,
                      content,
                    ]
                  : [content]}
              </>
            );
          })}
        </BlockSection>
      </main>
    </Page>
  );
}
