import * as V from "varsace";
import hooks from "../css-hooks";
import PageHeader from "./PageHeader";
import PageFooter from "./PageFooter";

export type Props = Parameters<typeof PageHeader>[0] & {
  children?: JSX.Node | JSX.Node[];
};

export default function ({ children, theme, pathname }: Props) {
  return (
    <html data-theme={theme} style={{ overflowY: "scroll" }}>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png?"
        />
        <script src="/htmx.js" defer></script>
        <link rel="stylesheet" href="/normalize.css" />
        <link rel="stylesheet" href="/onest.css" />
        <link rel="stylesheet" href="/montserrat.css" />
        <link rel="stylesheet" href="/inconsolata.css" />
        <link rel="stylesheet" href="/global.css" />
        <link rel="stylesheet" href="/hooks.css" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/default.min.css"
        />
      </head>
      <body
        hx-boost="true"
        style={hooks({
          fontFamily: "'Onest Variable', sans-serif",
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          lineHeight: 1.25,
          background: V.white,
          color: V.black,
          dark: { background: V.gray90, color: V.white },
        })}
      >
        <PageHeader theme={theme} pathname={pathname} />
        <div style={{ marginBottom: "2em" }}>{children}</div>
        <PageFooter style={{ marginTop: "auto" }} />
      </body>
    </html>
  );
}
