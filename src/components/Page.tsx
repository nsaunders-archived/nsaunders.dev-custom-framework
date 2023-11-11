import * as V from "../vars";
import * as Theme from "../data/Theme";
import hooks, { css as hooksCSS } from "../css-hooks";
import PageHeader from "./PageHeader";
import PageFooter from "./PageFooter";

export type Props = Parameters<typeof PageHeader>[0] & {
  store: {
    environment: "development" | "production";
  };
} & JSX.ElementChildrenAttribute;

export default function ({ children, cookie, path, store }: Props) {
  const theme = cookie.themePreference.value || Theme.defaultOption;
  return (
    <html data-theme={theme} style={{ overflowY: "scroll" }}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <base href={path.endsWith("/") ? path : `${path}/`} />
        <script src="/assets/htmx.js" defer></script>
        <link rel="stylesheet" href="/assets/normalize.css" />
        <link rel="stylesheet" href="/assets/onest.css" />
        <link rel="stylesheet" href="/assets/montserrat.css" />
        <link rel="stylesheet" href="/assets/inconsolata.css" />
        <link rel="stylesheet" href="/assets/prism.css" />
        <style>{hooksCSS}</style>
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
        <PageHeader cookie={cookie} path={path} />
        <div style={{ marginBottom: "2em" }}>{children}</div>
        <PageFooter style={{ marginTop: "auto" }} />
        {store.environment === "development" ? (
          <script>{`
            (function () {
              var ws = new WebSocket("ws" + (location.protocol === "https:" ? "s" : "") + "://" + location.host + "/development");
              ws.onclose = function() {
                setTimeout(function() {
                  location.reload();
                }, 1000);
              };
            })();
          `}</script>
        ) : undefined}
      </body>
    </html>
  );
}
