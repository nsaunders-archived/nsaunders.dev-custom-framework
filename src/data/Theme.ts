import * as S from "@effect/schema/Schema";

const options = ["light", "auto", "dark"] as const;

const schema = S.union(...options.map(x => S.literal(x)));

export const defaultOption: (typeof options)[number] = "auto";

export const parse = S.parse(schema);

export const parseOption = S.parseOption(schema);
