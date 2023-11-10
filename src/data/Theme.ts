import { Type, Static } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";

const opts = [
  Type.Literal("light"),
  Type.Literal("auto"),
  Type.Literal("dark"),
];

export const options = opts.map(o => o.const);

export const defaultOption: (typeof options)[number] = "auto";

export const schema = Type.Union(opts);

export const parse = (value: unknown): value is Static<typeof schema> =>
  Value.Check(schema, value);
