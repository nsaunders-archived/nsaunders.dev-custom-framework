import type * as CSS from "csstype";

import { buildHooksSystem, recommended } from "@css-hooks/core";

const createHooks = buildHooksSystem<CSS.Properties>();

const [css, hooks] = createHooks({
  ...recommended,
  groupHover: ".group:hover &",
  dark: {
    or: [
      "[data-theme='dark'] &",
      {
        and: ["[data-theme='auto'] &", "@media (prefers-color-scheme: dark)"],
      },
    ],
  },
  small: "@media (max-width: 640px)",
});

export default hooks;
export { css };
