import { PostBrief } from "../data/Posts";
import A from "./A";
import hooks from "../css-hooks";
import * as V from "varsace";
import * as Date from "../data/Date";
import * as ReadingTime from "../data/ReadingTime";

export type Props = {
  children: PostBrief;
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
        <span>{Date.formatLongDate(published)}</span>
        <span>{ReadingTime.format(readingTime)}</span>
      </div>
      <A href={`/posts/${name}`} style={{ fontSize: "2em" }}>
        {title}
      </A>
      <div style={{ lineHeight: 1.5 }}>{description}</div>
    </div>
  );
}
