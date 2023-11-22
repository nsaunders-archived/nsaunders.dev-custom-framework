import * as V from "varsace";
import hooks from "../css-hooks";
import PageHeader from "./PageHeader";
import PageFooter from "./PageFooter";

export type Props = Parameters<typeof PageHeader>[0] & {
  title: string;
  description: string;
  opengraph?: {
    title?: string;
    description?: string;
    image?: string;
    type?: "article";
  };
  twitter?: {
    card?: "summary_large_image";
  };
  children?: JSX.Node | JSX.Node[];
};

export default function ({
  children,
  description,
  opengraph,
  pathname,
  twitter,
  theme,
  title,
}: Props) {
  return (
    <html data-theme={theme} style={{ overflowY: "scroll" }}>
      <head>
        <meta charset="utf-8" />
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
        <title>{title} — nsaunders.dev</title>
        <meta name="description" content={description} />
        {Object.entries({
          title,
          description,
          url: `https://nsaunders.dev${pathname}`,
          site_name: "nsaunders.dev",
          ...opengraph,
        }).map(([property, content]) => (
          <meta property={`og:${property}`} content={content} />
        ))}
        {Object.entries({
          creator: "agilecoder",
          ...twitter,
        }).map(([property, content]) => (
          <meta property={`twitter:${property}`} content={content} />
        ))}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script src="/htmx.js" defer></script>
        <link rel="stylesheet" href="/normalize.css" />
        <link rel="stylesheet" href="/onest.css" />
        <link rel="stylesheet" href="/montserrat.css" />
        <link rel="stylesheet" href="/inconsolata.css" />
        <link rel="stylesheet" href="/global.css" />
        <link rel="stylesheet" href="/hooks.css" />
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
