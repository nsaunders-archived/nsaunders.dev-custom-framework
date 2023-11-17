import { HtmlElementsAttributesMap } from "html-tag-types";
import * as CSS from "csstype";

const voids = [
  "area",
  "base",
  "basefont",
  "bgsound",
  "br",
  "col",
  "command",
  "embed",
  "frame",
  "hr",
  "image",
  "img",
  "input",
  "keygen",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
] as const;

export default function h<Tag extends keyof HtmlElementsAttributesMap>(
  tag: Tag,
  attributes: Partial<
    Omit<HtmlElementsAttributesMap[Tag], "style"> & {
      style: CSS.Properties;
    }
  >,
  ...children: Tag extends (typeof voids)[number] ? [] : [string[]]
): string {
  const attrs = Object.entries(attributes)
    .flatMap(([name, value]: [string, unknown]) => {
      if (typeof value === "string" || typeof value === "number") {
        return [`${name}="${value}"`];
      }
      if (typeof value === "boolean" && value) {
        return [name];
      }
      if (value && typeof value === "object") {
        switch (name) {
          case "style":
            return [
              `${name}="${Object.entries(value)
                .map(
                  ([property, value]: [string, string | number]) =>
                    `${property.replace(
                      /[A-Z]/g,
                      x => `-${x.toLowerCase()}`,
                    )}:${value}`,
                )
                .join(";")}"`,
            ];
          case "class":
            return value instanceof Array
              ? [`${name}="${value.join(" ")}"`]
              : [];
          default:
            return [];
        }
      }
      return [];
    })
    .map(x => ` ${x}`)
    .join("");

  return voids.find(v => v === tag)
    ? `<${tag}${attrs}>`
    : `<${tag}${attrs}>${
        children && children.length && children[0].length
          ? children[0].join("")
          : ""
      }</${tag}>`;
}
