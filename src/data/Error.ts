import { Data, Option, pipe } from "effect";

export interface GeneralParseError extends Data.Case {
  readonly _tag: "GeneralParseError";
  readonly input: string;
  readonly cause: Option.Option<Error>;
}

export const GeneralParseError =
  Data.tagged<GeneralParseError>("GeneralParseError");

export function printGeneralParseError({ input, cause }: GeneralParseError) {
  return `Parsing failure.${pipe(
    cause,
    Option.map(error => ` ${error.message}`),
    Option.getOrElse(() => ""),
  )} Input: ${input}. End of input.`;
}

export interface NotFoundError extends Data.Case {
  readonly _tag: "NotFoundError";
  readonly description: string;
}

export const NotFoundError = Data.tagged<NotFoundError>("NotFoundError");
