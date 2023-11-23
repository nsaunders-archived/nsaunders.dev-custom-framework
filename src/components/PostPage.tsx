import { O } from "ts-toolbelt";
import * as V from "varsace";
import hooks from "../css-hooks";
import Page from "./Page";
import { Post } from "../data/Post";
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
} & O.Omit<Parameters<typeof Page>[0], "children" | "title" | "description">;

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
    <Page
      {...pageProps}
      title={title}
      description={description}
      opengraph={{
        ...pageProps.opengraph,
        image: `https://nsaunders.dev${pageProps.pathname}/opengraph.png`,
      }}
      twitter={{
        ...pageProps.twitter,
        card: "summary_large_image",
      }}
    >
      <main style={{ display: "flex", flexDirection: "column", gap: "2em" }}>
        <Jumbotron headline={title}>
          <p style={{ marginBlock: 0 }}>{description}</p>
          <div
            style={hooks({
              display: "flex",
              gap: "2em",
              fontSize: "0.75em",
              marginTop: "1em",
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
              value={Date.formatLongDate(published)}
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
        <BlockSection>
          <Subscribe />
        </BlockSection>
      </main>
    </Page>
  );
}

function Subscribe() {
  const flex = "1 1 calc((60ch - 100%) * 999)";
  return (
    <section
      style={{
        display: "flex",
        flexWrap: "wrap",
      }}
    >
      <div
        style={{ flex, background: V.gray05, color: V.gray80, padding: "3em" }}
      >
        <h1
          style={{
            fontSize: "2em",
            fontWeight: 700,
            lineHeight: 1.25,
            marginBlock: 0,
          }}
        >
          Stay informed
        </h1>
        <p
          style={{
            fontSize: "1.5em",
            fontWeight: 400,
            lineHeight: 1.25,
            marginBlock: "1em",
          }}
        >
          Subscribe to email updates and be the first to know when I post new
          content.
        </p>
        <p
          style={{
            fontWeight: 400,
            lineHeight: 1.25,
            marginBlock: 0,
            color: V.gray60,
          }}
        >
          I hate spam as much as you do.
          <br />
          Unsubscribe at any time — no hard feelings!
        </p>
      </div>
      <form
        hx-boost="false"
        style={{
          flex,
          background: V.gray80,
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          padding: "3em",
          gap: "2em",
        }}
        method="POST"
        action="https://dev.us21.list-manage.com/subscribe/post?u=1961e884a06fdad7a53bc160e&id=3f29e7fcdf&f_id=00905ce1f0"
      >
        {(
          [
            ["Email", "email", "EMAIL", true],
            ["First name", "text", "FNAME", false],
          ] as const
        ).map(([label, inputType, name, required]) => (
          <label
            style={{ display: "flex", flexDirection: "column", gap: "0.5em" }}
          >
            <div style={{ lineHeight: 1 }}>{label}</div>
            <input
              type={inputType}
              name={name}
              required={required}
              style={hooks({
                background: V.gray05,
                color: V.gray90,
                font: "inherit",
                lineHeight: 1,
                padding: "0.5em",
                border: 0,
                borderRadius: "0.25em",
                outlineWidth: 0,
                outlineStyle: "solid",
                outlineColor: V.blue50,
                outlineOffset: "2px",
                focusVisible: {
                  outlineWidth: "2px",
                },
              })}
            />
          </label>
        ))}
        <div aria-hidden="true" style="position: absolute; left: -5000px;">
          <input
            data-desc="thwart-bots"
            type="text"
            name="b_1961e884a06fdad7a53bc160e_3f29e7fcdf"
            tabindex={-1}
          />
        </div>
        <button
          type="submit"
          style={hooks({
            alignSelf: "center",
            font: "inherit",
            lineHeight: 1,
            padding: "0.5em 0.75em",
            margin: 0,
            border: 0,
            borderRadius: "0.25em",
            background: V.blue50,
            color: V.white,
            outlineWidth: 0,
            outlineStyle: "solid",
            outlineColor: V.blue50,
            outlineOffset: "2px",
            focusVisible: {
              outlineWidth: "2px",
            },
            hover: {
              background: V.blue40,
            },
            active: {
              background: V.red40,
            },
          })}
        >
          Subscribe
        </button>
      </form>
    </section>
  );
}
