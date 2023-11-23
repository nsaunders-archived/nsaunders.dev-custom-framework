import { HttpClient as Http } from "@effect/platform-browser";
import * as S from "@effect/schema/Schema";
import { Effect, Option, Order, ReadonlyArray, pipe } from "effect";
import matter from "front-matter";
import { GeneralParseError, NotFoundError } from "./Error";

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

const getPostContent = (name: string) =>
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

export type Post = Effect.Effect.Success<ReturnType<typeof getByName>>;

export const getByName = (name: string) =>
  pipe(
    Effect.all(
      [
        pipe(
          list(),
          Effect.map(ReadonlyArray.findFirst(post => post.name === name)),
          Effect.flatMap(
            Option.match({
              onNone: () =>
                Effect.fail(
                  NotFoundError({ description: `post named "${name}"` }),
                ),
              onSome: Effect.succeed,
            }),
          ),
        ),
        getPostContent(name),
      ],
      { concurrency: "unbounded" },
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
