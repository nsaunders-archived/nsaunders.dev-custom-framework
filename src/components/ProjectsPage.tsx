import { O } from "ts-toolbelt";
import Page from "./Page";
import { Projects } from "../data/Projects";
import BlockSection from "./BlockSection";
import ListItemEmphasis from "./ListItemEmphasis";
import ListLayout from "./ListLayout";
import ProjectListItem from "./ProjectListItem";

export type Props = { projects: Projects } & O.Omit<
  Parameters<typeof Page>[0],
  "children" | "title" | "description"
>;

export default function ({ projects, ...pageProps }: Props) {
  return (
    <Page
      {...pageProps}
      title="Projects"
      description="Overview of my programming projects and open-source contributions"
    >
      <main style={{ margin: "4em" }}>
        <BlockSection>
          <ListLayout title="Projects">
            <ul
              style={{
                listStyleType: "none",
                margin: 0,
                padding: 0,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(32ch,1fr))",
                gap: "1.5em",
              }}
            >
              {projects.map(project => (
                <li style={{ display: "grid" }}>
                  <ListItemEmphasis>
                    <ProjectListItem>{project}</ProjectListItem>
                  </ListItemEmphasis>
                </li>
              ))}
            </ul>
          </ListLayout>
        </BlockSection>
      </main>
    </Page>
  );
}
