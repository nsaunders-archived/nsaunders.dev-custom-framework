import { HttpClient } from "@effect/platform-browser";
import { ParseError } from "@effect/schema/ParseResult";
import { Data, Match, Option, pipe } from "effect";

export interface GeneralParseError extends Data.Case {
  readonly _tag: "GeneralParseError";
  readonly input: string;
  readonly cause: Option.Option<Error>;
}

export const GeneralParseError =
  Data.tagged<GeneralParseError>("GeneralParseError");

export function printGeneralParseError({ input, cause }: GeneralParseError) {
  return `General parse error.${pipe(
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

export function printNotFoundError({ description }: NotFoundError) {
  return `Could not find ${description}.`;
}

export function printParseError({ errors }: ParseError) {
  return `Parse error${errors.length === 1 ? "" : "s"}.`;
}

export function printHttpClientRequestError({
  request,
  reason,
}: HttpClient.error.RequestError) {
  return `Request failed for ${request.url} (${reason}).`;
}

export function printHttpClientResponseError({
  request,
  reason,
}: HttpClient.error.ResponseError) {
  return `Response failed for ${request.url} (${reason}).`;
}

export const printHttpClientError =
  Match.type<HttpClient.error.HttpClientError>().pipe(
    Match.tag("RequestError", error => printHttpClientRequestError(error)),
    Match.tag("ResponseError", error => printHttpClientResponseError(error)),
    Match.exhaustive,
  );
