import { marked, RendererObject } from "marked";
import A from "./components/A";
import * as V from "./vars";
import hooks from "./css-hooks";
import h from "./h";
import * as CSS from "csstype";
import { getHighlighterCore } from "shikiji";
import { Data, Effect } from "effect";
import githubDark from "shikiji/themes/github-dark.mjs";
import githubLight from "shikiji/themes/github-light.mjs";
import css from "shikiji/langs/css.mjs";
import html from "shikiji/langs/html.mjs";
import javascript from "shikiji/langs/javascript.mjs";
import jsx from "shikiji/langs/jsx.mjs";
import typescript from "shikiji/langs/typescript.mjs";
import tsx from "shikiji/langs/tsx.mjs";
import slug from "slug";
import LinkIcon from "./components/LinkIcon";
import isAbsoluteURL from "is-absolute-url";

type RenderMarkdownError = Data.TaggedEnum<{
  RenderMarkdownHighlighterError: { message: string };
  RenderMarkdownRendererError: { message: string };
}>;

const { RenderMarkdownHighlighterError, RenderMarkdownRendererError } =
  Data.taggedEnum<RenderMarkdownError>();

const renderMarkdown = (content: string, { pathname }: { pathname: string }) =>
  Effect.gen(function* (_) {
    const highlighter = yield* _(
      Effect.tryPromise({
        try: () =>
          getHighlighterCore({
            themes: [githubDark, githubLight],
            langs: [css, html, javascript, jsx, typescript, tsx],
          }),
        catch: error =>
          RenderMarkdownHighlighterError(
            error instanceof Error ? error : { message: "Unknown failure" },
          ),
      }),
    );

    const renderer: RendererObject = {
      blockquote(quote) {
        return h(
          "blockquote" as const,
          {
            style: hooks({
              borderWidth: 0,
              borderLeftWidth: "8px",
              borderStyle: "solid",
              padding: "0.1px",
              paddingLeft: "1em",
              marginLeft: 0,
              borderColor: V.pink20,
              color: V.gray70,
              background: V.gray05,
              dark: {
                borderColor: V.pink60,
                background: V.gray85,
                color: V.gray30,
              },
            }),
          },
          [quote],
        );
      },
      code(code, lang) {
        if (
          lang === "css" ||
          lang === "html" ||
          lang === "javascript" ||
          lang === "jsx" ||
          lang === "typescript" ||
          lang === "tsx"
        ) {
          return h(
            "div",
            {
              style: hooks({
                background: V.gray05,
                dark: { background: V.gray85 },
              }),
            },
            [
              highlighter.codeToHtml(code, {
                lang,
                themes: {
                  dark: githubDark,
                  light: githubLight,
                },
                defaultColor: false,
              }),
            ],
          );
        }
        return false;
      },
      codespan(text) {
        return h(
          "code",
          {
            style: { fontFamily: "'Inconsolata Variable', monospace" },
          },
          [text],
        );
      },
      image(src, alt) {
        return h("img", {
          src: isAbsoluteURL(src) ? src : `${pathname}/${src}`,
          alt: alt || "",
        });
      },
      link(href, title, children) {
        const element: unknown = A({
          href,
          title: title || undefined,
          children,
        });
        return typeof element === "string" ? element : false;
      },
      heading(children, level) {
        if (
          level === 1 ||
          level === 2 ||
          level === 3 ||
          level === 4 ||
          level === 5 ||
          level === 6
        ) {
          const tag = `h${level}` as const;
          const style = [
            {
              fontSize: "calc(15em / 6)",
              fontWeight: 400,
              marginBlock: "0.25em",
            },
            {
              fontSize: "calc(13em / 6)",
              fontWeight: 400,
              marginBlock: "calc(14em * (3 / 104))",
            },
            {
              fontSize: "calc(11em / 6)",
              fontWeight: 400,
              marginBlock: "calc(27em / 44)",
            },
            {
              fontSize: "calc(5em / 3)",
              fontWeight: 400,
              marginBlock: "0.75em",
            },
            {
              fontSize: "calc(3em / 2)",
              fontWeight: 400,
              marginBlock: "calc(11em / 12)",
            },
            {
              fontSize: "calc(4em / 3)",
              fontWeight: 400,
              marginBlock: "calc(9em / 8)",
            },
          ][level - 1] as CSS.Properties;
          return h(tag, { id: slug(children), class: ["group"], style }, [
            h(
              "a",
              {
                href: `#${slug(children)}`,
                style: {
                  float: "left",
                  marginLeft: "-28px",
                  paddingRight: "8px",
                  color: "inherit",
                },
              },
              [
                h(
                  "div",
                  {
                    style: hooks({
                      visibility: "hidden",
                      width: "20px",
                      groupHover: { visibility: "visible" },
                    }),
                  },
                  [
                    (() => {
                      const el = LinkIcon({ size: "20px" });
                      return typeof el === "string" ? el : "";
                    })(),
                  ],
                ),
              ],
            ),
            children,
          ]);

          // <Tag id={slug(text)} class="group" style={style}>
          //   <a
          //     href={`#${slug(text)}`}
          //     style={{
          //       float: "left",
          //       marginLeft: "-28px",
          //       paddingRight: "8px",
          //       color: "inherit",
          //     }}
          //   >
          //     <div
          //       style={hooks({
          //         visibility: "hidden",
          //         width: "20px",
          //         groupHover: { visibility: "visible" },
          //       })}
          //     >
          //       <LinkIcon size="20px" />
          //     </div>
          //   </a>
          //   {text}
          // </Tag>
        }
        return false;
      },
    };

    return yield* _(
      Effect.try({
        try: () => marked.use({ gfm: true, renderer }).parse(content),
        catch: error =>
          RenderMarkdownRendererError(
            error instanceof Error ? error : { message: "Unknown failure" },
          ),
      }),
    );
  });

export default renderMarkdown;
