import { HttpClient as Http } from "@effect/platform-browser";
import * as S from "@effect/schema/Schema";
import {
  Effect,
  Match,
  Option,
  Order,
  ReadonlyArray,
  flow,
  pipe,
} from "effect";
import matter from "front-matter";
import {
  GeneralParseError,
  NotFoundError,
  printGeneralParseError,
  printHttpClientRequestError,
  printHttpClientResponseError,
  printNotFoundError,
  printParseError,
} from "./Error";
import { ParseError } from "@effect/schema/ParseResult";

const Posts = S.array(
  S.struct({
    name: S.string,
    title: S.string,
    description: S.string,
    published: S.Date,
    tags: S.array(S.string),
    readingTime: S.Int,
  }),
);

export type Posts = S.Schema.To<typeof Posts>;

export const newestFirst = Order.reverse(
  Order.mapInput(Order.Date, (post: Posts[number]) => post.published),
);

export type PostBrief = Effect.Effect.Success<ReturnType<typeof list>>[number];

export const printListError = flow(
  Match.type<Http.error.HttpClientError | ParseError>().pipe(
    Match.tag("ParseError", error => printParseError(error)),
    Match.tag("RequestError", error => printHttpClientRequestError(error)),
    Match.tag("ResponseError", error => printHttpClientResponseError(error)),
    Match.exhaustive,
  ),
  error => `Failed to list posts. ${error}`,
);

export const list = () =>
  Http.request
    .get(
      "https://raw.githubusercontent.com/nsaunders/writing/master/posts/index.json",
    )
    .pipe(
      Http.client.fetchOk(),
      Effect.flatMap(res => res.json),
      Effect.flatMap(S.parse(Posts)),
    );

const getContent = (name: string) =>
  Http.request
    .get(
      `https://raw.githubusercontent.com/nsaunders/writing/master/posts/${name}/index.md`,
    )
    .pipe(
      Http.client.fetchOk(),
      Effect.flatMap(res => res.text),
      Effect.flatMap(input =>
        Effect.try({
          try() {
            return matter(input).body;
          },
          catch(e) {
            return GeneralParseError({
              cause: e instanceof Error ? Option.some(e) : Option.none(),
              input,
            });
          },
        }),
      ),
    );

export const printGetByNameError = flow(
  Match.type<
    Http.error.HttpClientError | ParseError | GeneralParseError | NotFoundError
  >().pipe(
    Match.tag("RequestError", error => printHttpClientRequestError(error)),
    Match.tag("ResponseError", error => printHttpClientResponseError(error)),
    Match.tag("NotFoundError", error => printNotFoundError(error)),
    Match.tag("GeneralParseError", error => printGeneralParseError(error)),
    Match.tag("ParseError", error => printParseError(error)),
    Match.exhaustive,
  ),
  error => `Failed to get post by name. ${error}`,
);

export type Post = Effect.Effect.Success<ReturnType<typeof getByName>>;

export const getByName = (name: string) =>
  pipe(
    list(),
    Effect.map(ReadonlyArray.findFirst(post => post.name === name)),
    Effect.flatMap(
      Option.match({
        onNone: () =>
          Effect.fail(NotFoundError({ description: `post named "${name}"` })),
        onSome: Effect.succeed,
      }),
    ),
    Effect.flatMap(post =>
      Effect.map(getContent(name), content => [post, content] as const),
    ),
    Effect.map(([post, content]) => ({
      ...post,
      content,
      discussionHref: `https://x.com/search?q=${encodeURIComponent(
        `https://nsaunders.dev/posts/${name}`,
      )}`,
      editHref: `https://github.com/nsaunders/writing/edit/master/posts/${name}/index.md`,
    })),
  );
