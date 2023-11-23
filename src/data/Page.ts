import { HttpClient as Http } from "@effect/platform-browser";
import { Effect, flow } from "effect";
import { printHttpClientError } from "./Error";

export const printGetByNameError = flow(
  printHttpClientError,
  error => `Failed to get page by name. ${error}`,
);

export const getByName = (name: string) =>
  Http.request
    .get(
      `https://raw.githubusercontent.com/nsaunders/writing/master/pages/${name}/index.md`,
    )
    .pipe(
      Http.client.fetchOk(),
      Effect.flatMap(res => res.text),
      Effect.map(content => ({ name, content })),
    );
