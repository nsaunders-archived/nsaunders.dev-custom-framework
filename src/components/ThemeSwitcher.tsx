/// <reference types="@kitajs/html/htmx.d.ts" />

import * as Theme from "../data/Theme";
import SunIcon from "./SunIcon";
import MoonIcon from "./MoonIcon";
import * as V from "../vars";
import hooks from "../css-hooks";

type Props = {
  theme?: (typeof Theme.options)[number];
};

export default function ThemeSwitcher({ theme = Theme.defaultOption }: Props) {
  return (
    <div style={{ display: "inline-flex" }}>
      <form
        hx-post="/theme"
        hx-target="this"
        hx-select="form"
        hx-trigger="change"
        hx-swap="outerHTML"
        style={hooks({
          overflow: "hidden",
          display: "inline-flex",
          position: "relative",
          fontSize: "1em",
          width: "3em",
          borderRadius: "999px",
          color: V.white,
          background: V.purple60,
          outlineColor: V.blue50,
          dark: {
            background: V.yellow20,
            outlineColor: V.blue20,
            color: V.gray90,
          },
        })}
      >
        <div
          style={{
            position: "absolute",
            top: "calc(1em / 3)",
            right: "calc(1em / 3)",
            left: "calc(1em / 3)",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div
            style={hooks({
              width: "1em",
              height: "1em",
              borderRadius: "999px",
              background: "currentColor",
              display: "block",
              dark: { display: "none" },
            })}
          />
          <div
            style={hooks({
              color: V.yellow20,
              display: "contents",
              dark: { display: "none" },
            })}
          >
            <MoonIcon />
          </div>
          <div
            style={hooks({
              width: "1em",
              height: "1em",
              borderRadius: "999px",
              background: "currentColor",
              display: "none",
              dark: { display: "block" },
            })}
          />
          <div
            style={hooks({
              color: V.orange50,
              display: "none",
              dark: { display: "contents" },
            })}
          >
            <SunIcon />
          </div>
        </div>
        <select
          name="theme"
          style={hooks({
            zIndex: 1,
            appearance: "none",
            background: "transparent",
            color: "transparent",
            border: 0,
            borderRadius: "999px",
            lineHeight: 1,
            padding: "calc(1em / 3) 2em calc(1em / 3) calc(2em / 3)",
            outlineStyle: "solid",
            outlineWidth: 0,
            outlineOffset: "2px",
            focusVisible: {
              outlineWidth: "2px",
            },
          })}
        >
          {Theme.options.map(option => (
            <option
              selected={theme === option}
              style={{ background: V.white, color: V.black }}
            >
              {option}
            </option>
          ))}
        </select>
        <img
          src=""
          onerror={
            theme
              ? `document.querySelector("html").setAttribute("data-theme", "${theme}")`
              : ""
          }
          aria-hidden="true"
        />
      </form>
    </div>
  );
}
