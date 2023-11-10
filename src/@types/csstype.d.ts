import { Property } from "csstype";

declare module "csstype" {
  interface Properties {
    "--prism-scheme"?: "dark";
    "--prism-foreground"?: Property.Color;
    "--prism-background"?: Property.Color;
    "--prism-comment"?: Property.Color;
    "--prism-string"?: Property.Color;
    "--prism-literal"?: Property.Color;
    "--prism-keyword"?: Property.Color;
    "--prism-boolean"?: Property.Color;
    "--prism-constant"?: Property.Color;
    "--prism-number"?: Property.Color;
    "--prism-variable"?: Property.Color;
    "--prism-function"?: Property.Color;
    "--prism-deleted"?: Property.Color;
    "--prism-class"?: Property.Color;
    "--prism-builtin"?: Property.Color;
    "--prism-property"?: Property.Color;
    "--prism-namespace"?: Property.Color;
    "--prism-punctuation"?: Property.Color;
    "--prism-decorator"?: Property.Color;
    "--prism-regex"?: Property.Color;
    "--prism-json-property"?: Property.Color;
    "--prism-line-number"?: Property.Color;
    "--prism-line-number-gutter"?: Property.Color;
    "--prism-line-highlight-background"?: Property.Color;
    "--prism-selection-background"?: Property.Color;
    "--prism-selector"?: Property.Color;
    "--prism-interpolation"?: Property.Color;
    "--prism-operator"?: Property.Color;
  }
}
