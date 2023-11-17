import { Data } from "effect";

export interface GeneralParseError extends Data.Case {
  readonly _tag: "GeneralParseError";
  input: string;
  message: string;
}

export const GeneralParseError =
  Data.tagged<GeneralParseError>("GeneralParseError");

export interface NotFoundError extends Data.Case {
  readonly _tag: "NotFoundError";
  description: string;
}

export const NotFoundError = Data.tagged<NotFoundError>("NotFoundError");
