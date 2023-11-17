import { Type, Static } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import * as S from "@effect/schema/Schema";

const opts = [
  Type.Literal("light"),
  Type.Literal("auto"),
  Type.Literal("dark"),
];

export const options = opts.map(o => o.const);

export const defaultOption: (typeof options)[number] = "auto";

export const schema = Type.Union(opts);

const schema2 = S.union(
  S.literal("light"),
  S.literal("auto"),
  S.literal("dark"),
);

export const parse2 = S.parse(schema2);

export const parseOption = S.parseOption(schema2);

export const parse = (value: unknown): value is Static<typeof schema> =>
  Value.Check(schema, value);
