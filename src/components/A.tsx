import hooks from "../css-hooks";
import * as V from "varsace";
import * as CSS from "csstype";
import { O, U } from "ts-toolbelt";

export type Props = O.Omit<
  {
    selected?: boolean;
  } & JSX.IntrinsicElements["a"],
  "style"
> & { style?: CSS.Properties };

export default function ({ children, selected, style, ...restProps }: Props) {
  return (
    <a
      style={{
        ...hooks({
          color: selected ? "inherit" : V.blue40,
          textDecoration: "inherit",
          outlineWidth: 0,
          outlineStyle: "solid",
          outlineColor: V.blue20,
          outlineOffset: "2px",
          borderRadius: "2px",
          hover: {
            color: selected ? "inherit" : V.blue50,
            textDecoration: "underline",
          },
          active: {
            color: selected ? "inherit" : V.red50,
          },
          dark: {
            color: selected ? "inherit" : V.blue30,
            outlineColor: V.blue50,
            ...(selected
              ? {}
              : {
                  hover: {
                    color: V.blue20,
                  },
                  active: {
                    color: V.red20,
                  },
                }),
          },
          focusVisible: {
            outlineWidth: "2px",
          },
        }),
        ...style,
      }}
      {...restProps}
    >
      {children}
    </a>
  );
}
