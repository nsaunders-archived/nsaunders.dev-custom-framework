import { O } from "ts-toolbelt";
import * as V from "varsace";
import hooks from "../css-hooks";
import Page from "./Page";
import * as Posts from "../data/Posts";
import { NotFoundError } from "elysia";
import Jumbotron from "./Jumbotron";
import BlockSection from "./BlockSection";
import Markdown from "./Markdown";
import CalendarIcon from "./CalendarIcon";
import ClockIcon from "./ClockIcon";
import FormatReadingTime from "./FormatReadingTime";
import FormatDate from "./FormatDate";
import LabelValuePair from "./LabelValuePair";
import ScreenReaderOnly from "./ScreenReaderOnly";
import A from "./A";

export type Props = O.Omit<Parameters<typeof Page>[0], "children"> & {
  params: { name: string };
};

export default async function ({ params: { name }, ...pageProps }: Props) {
  const post = await Posts.getByName(name);
  if (!post) {
    throw new NotFoundError("The requested post does not exist.");
  }
  const {
    title,
    description,
    published,
    readingTime,
    content,
    discussionHref,
    editHref,
  } = post;
  return (
    <Page {...pageProps}>
      <main style={{ display: "flex", flexDirection: "column", gap: "2em" }}>
        <Jumbotron headline={title}>
          <p style={{ marginBlock: 0 }}>{description}</p>
          <div
            style={hooks({
              display: "flex",
              gap: "2em",
              fontSize: "0.75em",
              marginTop: "2em",
              color: V.gray60,
              dark: {
                color: V.gray30,
              },
            })}
          >
            <LabelValuePair
              label={
                <>
                  <CalendarIcon aria-hidden />
                  <ScreenReaderOnly>Posted date</ScreenReaderOnly>
                </>
              }
              value={<FormatDate>{published}</FormatDate>}
            />
            <LabelValuePair
              label={
                <>
                  <ClockIcon aria-hidden />
                  <ScreenReaderOnly>Reading time</ScreenReaderOnly>
                </>
              }
              value={<FormatReadingTime>{readingTime}</FormatReadingTime>}
            />
          </div>
        </Jumbotron>
        <BlockSection>
          <Markdown>{content}</Markdown>
          <div
            style={{ display: "flex", gap: "0.5em", marginBlockStart: "2em" }}
          >
            <A href={discussionHref}>Discuss this post</A>
            <span style={{ color: V.gray50 }}>|</span>
            <A href={editHref}>Suggest an edit</A>
          </div>
        </BlockSection>
      </main>
    </Page>
  );
}
