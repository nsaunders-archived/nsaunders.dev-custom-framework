import { O } from "ts-toolbelt";
import * as V from "varsace";
import hooks from "../css-hooks";
import Page from "./Page";
import { Post } from "../data/Posts";
import Jumbotron from "./Jumbotron";
import BlockSection from "./BlockSection";
import CalendarIcon from "./CalendarIcon";
import ClockIcon from "./ClockIcon";
import * as ReadingTime from "../data/ReadingTime";
import * as Date from "../data/Date";
import LabelValuePair from "./LabelValuePair";
import ScreenReaderOnly from "./ScreenReaderOnly";
import A from "./A";

export type Props = {
  post: Omit<Post, "content"> & { content: JSX.Element };
} & O.Omit<Parameters<typeof Page>[0], "children">;

export default function ({
  post: {
    title,
    description,
    published,
    readingTime,
    content,
    discussionHref,
    editHref,
  },
  ...pageProps
}: Props) {
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
              value={Date.format(published)}
            />
            <LabelValuePair
              label={
                <>
                  <ClockIcon aria-hidden />
                  <ScreenReaderOnly>Reading time</ScreenReaderOnly>
                </>
              }
              value={ReadingTime.format(readingTime)}
            />
          </div>
        </Jumbotron>
        <BlockSection>
          <div style={{ lineHeight: 1.5 }}>{content}</div>
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
