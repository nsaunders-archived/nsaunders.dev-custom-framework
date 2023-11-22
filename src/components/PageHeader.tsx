import * as V from "varsace";
import hooks from "../css-hooks";
import A from "./A";
import ThemeSwitcher from "./ThemeSwitcher";
import * as Theme from "../data/Theme";

export type Props = {
  theme: (typeof Theme.options)[number];
  pathname: string;
};

export default function ({ theme, pathname }: Props) {
  return (
    <header
      style={hooks({
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1em",
        background: V.gray05,
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
      <>
        {(
          [
            ["/posts", "Posts"],
            ["/projects", "Projects"],
            ["/about", "About"],
          ] as const
        ).map(([href, label]) => (
          <A href={href} selected={pathname.startsWith(href)}>
            {label}
          </A>
        ))}
      </>
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
