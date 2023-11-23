import { Post } from "../data/Post";
import * as V from "varsace";

export const width = 1200;

export const height = 630;

export const fonts = [["onest", 400]] as const;

export default function ({ post: { title, description } }: { post: Post }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: V.gray85,
        padding: "4em",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "space-between",
        fontSize: "24px",
        lineHeight: 1.25,
        color: V.white,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.666em",
        }}
      >
        <div style={{ fontSize: "2em" }}>{title}</div>
        <div style={{ fontSize: "1.333em", color: V.gray20 }}>
          {description}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <img
          src="https://github.com/nsaunders.png"
          alt="Nick Saunders"
          style={{ width: 64, height: 64, borderRadius: 9999 }}
        />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span>Nick Saunders</span>
          <span style={{ color: V.blue30 }}>nsaunders.dev</span>
        </div>
      </div>
    </div>
  );
}
