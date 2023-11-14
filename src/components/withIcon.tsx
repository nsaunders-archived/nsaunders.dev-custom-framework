import { Html } from "@kitajs/html";
import * as CSS from "csstype";
import { O } from "ts-toolbelt";

type Options = {
  viewBoxSize?: number;
  fill?: "none";
  stroke?: "currentColor";
  "stroke-linecap"?: "round";
  "stroke-linejoin"?: "round";
  "stroke-width"?: "2";
};

export default function withIcon(
  renderChildren: () => JSX.ElementChildrenAttribute["children"],
  options?: Options,
) {
  const { viewBoxSize = 24, ...restOptions } = options || {};

  type Props = {
    size?: CSS.Properties["width"];
  } & O.Omit<JSX.IntrinsicElements["svg"], "viewBox" | "width" | "height">;

  return ({ size = "1em", ...restProps }: Props) => (
    <svg
      viewBox={`0 0 ${viewBoxSize || 24} ${viewBoxSize || 24}`}
      width={size}
      height={size}
      fill="currentColor"
      {...restOptions}
      {...restProps}
    >
      {renderChildren()}
    </svg>
  );
}
