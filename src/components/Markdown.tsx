import { Html } from "@kitajs/html";
import { marked, RendererObject } from "marked";
import A from "./A";
import * as V from "../vars";
import hooks from "../css-hooks";
import LinkIcon from "./LinkIcon";
import slug from "slug";
import { getHighlighterCore } from "shikiji";
import githubDark from "shikiji/themes/github-dark.mjs";
import githubLight from "shikiji/themes/github-light.mjs";
import css from "shikiji/langs/css.mjs";
import html from "shikiji/langs/html.mjs";
import javascript from "shikiji/langs/javascript.mjs";
import jsx from "shikiji/langs/jsx.mjs";
import typescript from "shikiji/langs/typescript.mjs";
import tsx from "shikiji/langs/tsx.mjs";

export type Props = {
  children?: string;
};

async function renderer(): Promise<RendererObject> {
  const highlighter = await getHighlighterCore({
    themes: [githubDark, githubLight],
    langs: [css, html, javascript, jsx, typescript, tsx],
  });

  return {
    blockquote(quote: string) {
      const element = (
        <blockquote
          style={hooks({
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
          })}
        >
          {quote}
        </blockquote>
      );
      if (typeof element === "string") {
        return element;
      }
      return false;
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
        const element = (
          <div
            style={hooks({
              background: V.gray05,
              dark: { background: V.gray85 },
            })}
          >
            {highlighter.codeToHtml(code, {
              lang,
              themes: {
                dark: githubDark,
                light: githubLight,
              },
              defaultColor: false,
            })}
          </div>
        );
        if (typeof element === "string") {
          return element;
        }
      }
      return false;
    },
    codespan(text) {
      const element = (
        <code style={{ fontFamily: "'Inconsolata Variable', monospace" }}>
          {text}
        </code>
      );
      if (typeof element === "string") {
        return element;
      }
      return false;
    },
    link(href, title, text) {
      const element = (
        <A href={href} title={title || undefined}>
          {text}
        </A>
      );
      if (typeof element === "string") {
        return element;
      }
      return false;
    },
    heading(text, level) {
      if (
        level === 1 ||
        level === 2 ||
        level === 3 ||
        level === 4 ||
        level === 5 ||
        level === 6
      ) {
        const Tag = `h${level}` as const;
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
        ][level - 1];
        const element = (
          <Tag id={slug(text)} class="group" style={style}>
            <a
              href={`#${slug(text)}`}
              style={{
                float: "left",
                marginLeft: "-28px",
                paddingRight: "8px",
                color: "inherit",
              }}
            >
              <div
                style={hooks({
                  visibility: "hidden",
                  width: "20px",
                  groupHover: { visibility: "visible" },
                })}
              >
                <LinkIcon size="20px" />
              </div>
            </a>
            {text}
          </Tag>
        );
        if (typeof element === "string") {
          return element;
        }
      }
      return false;
    },
  };
}

export default async function Markdown({ children }: Props) {
  return children ? (
    <div style={{ lineHeight: 1.5 }}>
      {marked.use({ gfm: true, renderer: await renderer() }).parse(children)}
    </div>
  ) : (
    ""
  );
}
