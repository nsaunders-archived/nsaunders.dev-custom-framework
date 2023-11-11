import { marked, RendererObject } from "marked";
import A from "./A";
import * as V from "../vars";
import hooks from "../css-hooks";
import * as Prism from "prismjs";
import LinkIcon from "./LinkIcon";
import slug from "slug";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";

export type Props = {
  children?: string;
};

const renderer: RendererObject = {
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
          background: V.gray10,
          dark: {
            borderColor: V.pink60,
            background: V.black,
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
  code(code, language, escaped) {
    if (
      language === "typescript" ||
      language === "tsx" ||
      language === "javascript" ||
      language === "html"
    ) {
      const element = (
        <pre
          style={hooks({
            background: "var(--prism-background)",
            boxShadow: `inset 0 0 0 1px ${V.gray30}`,
            padding: "1em",
            "--prism-foreground": V.gray80,
            "--prism-background": V.white,
            "--prism-comment": V.teal50,
            "--prism-string": V.red50,
            "--prism-literal": V.teal70,
            "--prism-number": V.blue60,
            "--prism-keyword": V.green80,
            "--prism-function": V.green70,
            "--prism-boolean": V.green80,
            "--prism-constant": V.orange60,
            "--prism-deleted": V.red60,
            "--prism-class": V.teal60,
            "--prism-builtin": V.red50,
            "--prism-property": V.orange50,
            "--prism-namespace": V.pink50,
            "--prism-punctuation": V.gray50,
            "--prism-decorator": V.red40,
            "--prism-regex": V.orange60,
            "--prism-json-property": V.gray60,
            "--prism-selector": V.purple60,
            "--prism-operator": V.gray40,
            dark: {
              boxShadow: "none",
              "--prism-scheme": "dark",
              "--prism-foreground": V.gray10,
              "--prism-background": V.gray80,
              "--prism-comment": V.teal40,
              "--prism-string": V.red20,
              "--prism-literal": V.teal40,
              "--prism-keyword": V.teal40,
              "--prism-boolean": V.green60,
              "--prism-constant": V.orange20,
              "--prism-number": V.blue30,
              "--prism-variable": V.yellow30,
              "--prism-function": V.yellow30,
              "--prism-deleted": V.red30,
              "--prism-class": V.teal30,
              "--prism-builtin": V.orange30,
              "--prism-property": V.orange30,
              "--prism-namespace": V.pink20,
              "--prism-punctuation": V.gray40,
              "--prism-decorator": V.red30,
              "--prism-regex": V.orange40,
              "--prism-json-property": V.gray40,
              "--prism-line-number": V.gray40,
              "--prism-line-number-gutter": V.white,
              "--prism-line-highlight-background": V.gray60,
              "--prism-selection-background": V.gray60,
              "--prism-selector": V.purple20,
              "--prism-interpolation": V.yellow20,
            },
          })}
        >
          <code style={{ fontFamily: "'Inconsolata Variable', monospace" }}>
            {Prism.highlight(code, Prism.languages[language], language)}
          </code>
        </pre>
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

export default function Markdown({ children }: Props) {
  return children ? (
    <div style={{ lineHeight: 1.5 }}>
      {marked.use({ gfm: true, renderer }).parse(children)}
    </div>
  ) : (
    ""
  );
}
