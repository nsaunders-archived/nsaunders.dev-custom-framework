import * as S from "@effect/schema/Schema";
import {
  Data,
  Effect,
  Option,
  Order,
  ReadonlyArray,
  Request,
  RequestResolver,
  pipe,
} from "effect";
import matter from "front-matter";

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

interface ListPostsError extends Data.Case {
  readonly _tag: "ListPostsError";
}

const ListPostsError = Data.tagged<ListPostsError>("ListPostsError");

interface ListPosts extends Request.Request<ListPostsError, Posts> {
  readonly _tag: "ListPosts";
}

const ListPosts = Request.tagged<ListPosts>("ListPosts");

const ListPostsResolver = RequestResolver.fromEffect((_: ListPosts) =>
  Effect.gen(function* (_) {
    const response = yield* _(
      Effect.tryPromise({
        try: () =>
          fetch(
            "https://raw.githubusercontent.com/nsaunders/writing/master/posts/index.json",
          ).then(res => res.json()),
        catch: () => ListPostsError(),
      }),
    );

    return yield* _(
      Effect.orElseFail(S.parse(Posts)(response), () => ListPostsError()),
    );
  }),
);

export const list = () => Effect.request(ListPosts({}), ListPostsResolver);

export const newestFirst = Order.reverse(
  Order.mapInput(Order.Date, (post: Posts[number]) => post.published),
);

interface GetPostContentError extends Data.Case {
  readonly _tag: "GetPostContentError";
}

const GetPostContentError = Data.tagged<GetPostContentError>(
  "GetPostContentError",
);

interface GetPostContent extends Request.Request<GetPostContentError, string> {
  readonly _tag: "GetPostContent";
  name: string;
}

const GetPostContent = Request.tagged<GetPostContent>("GetPostContent");

const GetPostContentResolver = RequestResolver.fromEffect(
  ({ name }: GetPostContent) =>
    Effect.gen(function* (_) {
      const response = yield* _(
        Effect.tryPromise({
          try: () =>
            fetch(
              `https://raw.githubusercontent.com/nsaunders/writing/master/posts/${name}/index.md`,
            ).then(res => res.text()),
          catch: () => GetPostContentError(),
        }),
      );

      return yield* _(
        Effect.try({
          try: () => matter(response).body,
          catch: () => GetPostContentError(),
        }),
      );
    }),
);

class GetByNameNoMatchingPostError {
  readonly _tag = "GetByNameNoMatchingPostError";
}

export type Post = Effect.Effect.Success<ReturnType<typeof getByName>>;

export const getByName = (name: string) =>
  Effect.gen(function* (_) {
    const [posts, content] = yield* _(
      Effect.all(
        [
          Effect.request(ListPosts({}), ListPostsResolver),
          Effect.request(GetPostContent({ name }), GetPostContentResolver),
        ],
        { concurrency: "unbounded" },
      ),
    );

    const meta = yield* _(
      pipe(
        posts,
        ReadonlyArray.findFirst(post => post.name === name),
        Option.match({
          onNone: () => Effect.fail(new GetByNameNoMatchingPostError()),
          onSome: Effect.succeed,
        }),
      ),
    );

    return {
      ...meta,
      content,
      discussionHref: `https://x.com/search?q=${encodeURIComponent(
        `https://nsaunders.dev/posts/${name}`,
      )}`,
      editHref: `https://github.com/nsaunders/writing/edit/master/posts/${name}/index.md`,
    };
  });
