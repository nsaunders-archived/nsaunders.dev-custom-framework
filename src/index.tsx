import { Console, Effect, Either, Option, ReadonlyArray, pipe } from "effect";
import { getAssetFromKV } from "@cloudflare/kv-asset-handler";
import createHttpError from "http-errors";
import { css as hooksCSS } from "./css-hooks";

import * as HTML from "./data/HTML";
import * as Markdown from "./data/Markdown";
import * as Pages from "./data/Pages";
import * as Posts from "./data/Posts";
import * as Projects from "./data/Projects";
import * as Theme from "./data/Theme";

import AboutPage from "./components/AboutPage";
import HomePage from "./components/HomePage";
import PostsPage from "./components/PostsPage";
import PostPage from "./components/PostPage";
import ProjectsPage from "./components/ProjectsPage";
import PostOpengraphImage from "./components/PostOpengraphImage";
import * as PostOpengraphImageMeta from "./components/PostOpengraphImage";
import ThemeSwitcher from "./components/ThemeSwitcher";

// @ts-ignore
import manifestJSON from "__STATIC_CONTENT_MANIFEST";
const assetManifest = JSON.parse(manifestJSON);

type Environment = {
  __STATIC_CONTENT: unknown;
};

const htmlDoctype = "<!DOCTYPE html>";

export default {
  fetch(request: Request, env: Environment, ctx: ExecutionContext) {
    const handler = Effect.gen(function* (_) {
      const pathname = yield* _(
        Effect.try({
          try: () => new URL(request.url).pathname,
          catch: () =>
            createHttpError(400, `Invalid request URL ${request.url}`),
        }),
      );

      if (pathname === "/theme") {
        if (!/^post$/i.test(request.method)) {
          yield* _(
            Effect.fail(
              createHttpError(
                405,
                "Only the POST method is supported under the /themes path.",
              ),
            ),
          );
        }

        const formData = yield* _(
          Effect.tryPromise({
            try: () => request.formData(),
            catch: () =>
              createHttpError(400, "Unable to parse request body as form data"),
          }),
        );

        if (!formData.has("theme")) {
          yield* _(
            Effect.fail(
              createHttpError(
                400,
                'Form data do not include the required "theme" key.',
              ),
            ),
          );
        }

        const theme = yield* _(
          Theme.parse(formData.get("theme")),
          Effect.mapError(inner =>
            createHttpError(400, `Invalid theme "${formData.get("theme")}"`, {
              inner,
            }),
          ),
        );

        return new Response(HTML.render(<ThemeSwitcher theme={theme} />), {
          headers: {
            "Content-Type": "text/html",
            "Set-Cookie": `theme=${theme}; Max-Age: ${/*1 year*/ 31558464}`,
          },
        });
      }

      const theme = pipe(
        Option.fromNullable(request.headers.get("Cookie")),
        Option.map(
          x =>
            Object.fromEntries(
              x
                .split("; ")
                .map(x => x.split("="))
                .filter(x => x.length === 2),
            ) as Record<string, string>,
        ),
        Option.flatMap(cookies => Option.fromNullable(cookies["theme"])),
        Option.flatMap(Theme.parseOption),
        Option.getOrElse(() => "auto" as const),
      );

      if (/^get$/i.test(request.method)) {
        if (pathname === "/hooks.css") {
          return new Response(hooksCSS, {
            headers: {
              "Content-Type": "text/css",
            },
          });
        }

        if (pathname === "/") {
          const [posts, featuredProject] = yield* _(
            Effect.all(
              [
                pipe(
                  Posts.list(),
                  Effect.mapError(inner =>
                    createHttpError(
                      500,
                      "An error occurred while listing posts.",
                      { inner },
                    ),
                  ),
                ),
                pipe(
                  Projects.getFeatured(),
                  Effect.mapError(inner =>
                    createHttpError(
                      500,
                      "An error occurred while getting the featured project.",
                      { inner },
                    ),
                  ),
                ),
              ],
              { concurrency: "unbounded" },
            ),
          );

          const latestPost = pipe(
            posts,
            ReadonlyArray.sort(Posts.newestFirst),
            Option.fromIterable,
          );

          return new Response(
            htmlDoctype +
              HTML.render(
                <HomePage
                  theme={theme}
                  pathname={pathname}
                  latestPost={Option.getOrUndefined(latestPost)}
                  featuredProject={Option.getOrUndefined(featuredProject)}
                />,
              ),
            {
              headers: {
                "Content-Type": "text/html",
              },
            },
          );
        }

        if (pathname === "/projects") {
          const projects = yield* _(
            Projects.list(),
            Effect.mapError(inner =>
              createHttpError(
                500,
                "An error occurred while listing projects.",
                { inner },
              ),
            ),
          );

          return new Response(
            htmlDoctype +
              HTML.render(
                <ProjectsPage
                  theme={theme}
                  pathname={pathname}
                  projects={projects}
                />,
              ),
            {
              headers: {
                "Content-Type": "text/html",
              },
            },
          );
        }

        if (pathname === "/about") {
          const page = yield* _(
            Pages.getByName("about"),
            Effect.mapError(inner =>
              createHttpError(
                500,
                "An error occurred while fetching the about page content.",
                { inner },
              ),
            ),
          );

          const content = yield* _(
            Markdown.render(page.content, { pathname }),
            Effect.mapError(inner =>
              createHttpError(
                500,
                "An error occurred while rendering the markdown content as HTML.",
                { content: page.content, inner },
              ),
            ),
          );

          return new Response(
            htmlDoctype +
              HTML.render(
                <AboutPage
                  theme={theme}
                  pathname={pathname}
                  content={content}
                />,
              ),
            {
              headers: {
                "Content-Type": "text/html",
              },
            },
          );
        }

        if (pathname === "/posts") {
          const posts = yield* _(
            Posts.list(),
            Effect.orElseFail(() =>
              createHttpError(500, "An error occurred while listing posts."),
            ),
          );

          return new Response(
            htmlDoctype +
              HTML.render(
                <PostsPage theme={theme} pathname={pathname} posts={posts} />,
              ),
            {
              headers: {
                "Content-Type": "text/html",
              },
            },
          );
        }

        const postsMatch = pathname.match(/^\/posts\/([a-z\-]+)(\/(.+))?$/);
        const postName = Option.fromNullable(postsMatch?.[1]);
        const postResource = Option.fromNullable(postsMatch?.[3]);

        if (Option.isSome(postName)) {
          const name = postName.value;

          if (Option.isSome(postResource)) {
            if (postResource.value === "opengraph.png") {
              return yield* _(
                HTML.renderImage(
                  <PostOpengraphImage />,
                  PostOpengraphImageMeta.dimensions,
                ),
                Effect.mapBoth({
                  onFailure(cause) {
                    return createHttpError(
                      500,
                      "An error occurred while rendering the Opengraph image.",
                      { cause },
                    );
                  },
                  onSuccess(body) {
                    return new Response(body, {
                      headers: {
                        "Content-Type": "image/png",
                      },
                    });
                  },
                }),
              );
            }

            return new Response(null, {
              status: 302,
              headers: {
                Location: `https://github.com/nsaunders/writing/raw/master/posts/${name}/${postResource.value}`,
              },
            });
          }

          const post = yield* _(
            Posts.getByName(name),
            Effect.orElseFail(() =>
              createHttpError(
                500,
                `An error occurred while fetching post "${name}".`,
              ),
            ),
          );

          const content = yield* _(
            Markdown.render(post.content, { pathname }),
            Effect.mapError(inner =>
              createHttpError(
                500,
                "An error occurred while rendering the markdown content.",
                { post: post.name, inner },
              ),
            ),
          );

          return new Response(
            htmlDoctype +
              HTML.render(
                <PostPage
                  theme={theme}
                  pathname={pathname}
                  post={{ ...post, content }}
                />,
              ),
            {
              headers: {
                "Content-Type": "text/html",
              },
            },
          );
        }
      }

      return yield* _(
        Effect.tryPromise({
          try: () =>
            getAssetFromKV(
              {
                request,
                waitUntil: ctx.waitUntil.bind(ctx),
              },
              {
                ASSET_NAMESPACE: env.__STATIC_CONTENT,
                ASSET_MANIFEST: assetManifest,
              },
            ),
          catch: () =>
            createHttpError(404, `No resource exists at path ${pathname}`),
        }),
      );
    });

    return Effect.runPromise(
      Effect.gen(function* (_) {
        const result = yield* _(Effect.either(handler));
        return yield* _(
          Either.match(result, {
            onLeft: error =>
              Effect.gen(function* (_) {
                if (error.expose) {
                  return new Response(error.message, { status: error.status });
                }
                yield* _(Console.error(error));
                return new Response(
                  "I'm sorry, but I'm unable to fulfill your request due to an error. It's not your fault. Please try again.",
                  { status: 500 },
                );
              }),
            onRight: Effect.succeed,
          }),
        );
      }),
    );
  },
};
