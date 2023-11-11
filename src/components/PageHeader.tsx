import * as V from "../vars";
import hooks from "../css-hooks";
import A from "./A";
import ThemeSwitcher from "./ThemeSwitcher";
import * as Theme from "../data/Theme";

export type Props = {
  cookie: {
    themePreference: {
      value: (typeof Theme.options)[number] | undefined;
    };
  };
  path: string;
};

export default function ({
  cookie: {
    themePreference: { value: theme },
  },
  path,
}: Props) {
  return (
    <header
      style={hooks({
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1em",
        background: V.gray10,
        padding: "0.25em 1em",
        dark: {
          background: V.gray80,
        },
      })}
    >
      <A
        href="/"
        style={hooks({
          fontFamily: "'Montserrat Variable'",
          textTransform: "uppercase",
          fontSize: "1.6em",
        })}
        selected
      >
        Nick Saunders
      </A>
      <div style={{ flex: 1 }} />
      {[
        ["/posts", "Posts"],
        ["/projects", "Projects"],
        ["/about", "About"],
      ].map(([href, label]) => (
        <A href={href} selected={path.startsWith(href)}>
          {label}
        </A>
      ))}
      <hr
        style={hooks({
          border: 0,
          width: "1px",
          height: "2rem",
          background: V.gray20,
          dark: { background: V.gray60 },
        })}
      />{" "}
      <ThemeSwitcher theme={theme} />
    </header>
  );
}
