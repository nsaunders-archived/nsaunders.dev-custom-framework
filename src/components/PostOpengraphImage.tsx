import { Post } from "../data/Posts";
import * as V from "../vars";

export const dimensions = {
  width: 1200,
  height: 630,
};

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
        fontFamily: "'Onest', sans-serif",
        fontSize: "24px",
        color: V.white,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "calc(2em / 3)",
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
