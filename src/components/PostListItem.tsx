import * as Posts from "../data/Posts";
import A from "./A";
import FormatDate from "./FormatDate";
import FormatReadingTime from "./FormatReadingTime";
import hooks from "../css-hooks";
import * as V from "varsace";

export type Props = {
  children: Awaited<ReturnType<typeof Posts.list>>[number];
};

export default function PostListItem({
  children: { name, title, published, description, readingTime },
}: Props) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "0.5em",
      }}
    >
      <div
        style={hooks({
          display: "flex",
          gap: "0.5em",
          color: V.gray60,
          dark: {
            color: V.gray30,
          },
        })}
      >
        <span>
          <FormatDate>{published}</FormatDate>
        </span>
        <span>
          <FormatReadingTime>{readingTime}</FormatReadingTime>
        </span>
      </div>
      <A href={`/posts/${name}`} style={{ fontSize: "2em" }}>
        {title}
      </A>
      <div style={{ lineHeight: 1.5 }}>{description}</div>
    </div>
  );
}
