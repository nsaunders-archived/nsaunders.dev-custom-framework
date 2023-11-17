import { Html } from "@kitajs/html";
import { Console, Effect, Either, Option, ReadonlyArray, pipe } from "effect";
import { getAssetFromKV } from "@cloudflare/kv-asset-handler";
import createHttpError from "http-errors";
import * as Pages from "./data/Pages";
import * as Posts from "./data/Posts";
import * as Projects from "./data/Projects";
import * as Theme from "./data/Theme";

// @ts-ignore
import manifestJSON from "__STATIC_CONTENT_MANIFEST";
import ThemeSwitcher from "./components/ThemeSwitcher";
import HomePage from "./components/HomePage";
import PostsPage from "./components/PostsPage";
import PostPage from "./components/PostPage";
const assetManifest = JSON.parse(manifestJSON);
import { loadWasm } from "shikiji/core";

// import wasm as assets
// @ts-ignore
import wasm from "../node_modules/shikiji/dist/onig.wasm";
import ProjectsPage from "./components/ProjectsPage";
import renderMarkdown from "./renderMarkdown";
import AboutPage from "./components/AboutPage";

// load wasm outside of `fetch` so it can be reused
await loadWasm(obj => WebAssembly.instantiate(wasm, obj));

type Environment = {
  __STATIC_CONTENT: unknown;
};

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
                'Form data does not include the required "theme" key.',
              ),
            ),
          );
        }

        const theme = yield* _(
          Effect.orElseFail(Theme.parse2(formData.get("theme")), () =>
            createHttpError(400, `Invalid theme "${formData.get("theme")}"`),
          ),
        );

        const html = yield* _(
          Effect.orElseFail(
            Effect.promise(async () => await (<ThemeSwitcher theme={theme} />)),
            () =>
              createHttpError(
                500,
                "Content rendering failure. Please try again.",
              ),
          ),
        );

        return new Response(html, {
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
        if (pathname === "/") {
          const [posts, featuredProject] = yield* _(
            Effect.all(
              [
                pipe(
                  Posts.list(),
                  Effect.orElseFail(() =>
                    createHttpError(
                      500,
                      "An error occurred while listing posts.",
                    ),
                  ),
                ),
                pipe(
                  Projects.getFeatured(),
                  Effect.orElseFail(() =>
                    createHttpError(
                      500,
                      "An error occurred while getting the featured project.",
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

          const html = yield* _(
            Effect.tryPromise({
              try: async () =>
                await (
                  <HomePage
                    theme={theme}
                    pathname={pathname}
                    latestPost={Option.getOrUndefined(latestPost)}
                    featuredProject={Option.getOrUndefined(featuredProject)}
                  />
                ),
              catch: () =>
                createHttpError(
                  500,
                  "An error occurred while rendering the homepage.",
                ),
            }),
          );

          return new Response(html, {
            headers: {
              "Content-Type": "text/html",
            },
          });
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

          const html = yield* _(
            Effect.tryPromise({
              try: async () =>
                await (
                  <ProjectsPage
                    theme={theme}
                    pathname={pathname}
                    projects={projects}
                  />
                ),
              catch: () =>
                createHttpError(
                  500,
                  "An error occurred while rendering the project page.",
                ),
            }),
          );

          return new Response(html, {
            headers: {
              "Content-Type": "text/html",
            },
          });
        }

        if (pathname === "/about") {
          const page = yield* _(Pages.getByName("about"));

          const content = yield* _(renderMarkdown(page.content, { pathname }));

          const html = yield* _(
            Effect.tryPromise({
              try: async () =>
                await (
                  <AboutPage
                    theme={theme}
                    pathname={pathname}
                    content={content}
                  />
                ),
              catch: () =>
                createHttpError(
                  500,
                  "An error occurred while rendering the about page.",
                ),
            }),
          );

          return new Response(html, {
            headers: {
              "Content-Type": "text/html",
            },
          });
        }

        if (pathname === "/posts") {
          const posts = yield* _(
            Posts.list(),
            Effect.orElseFail(() =>
              createHttpError(500, "An error occurred while listing posts."),
            ),
          );

          const html = yield* _(
            Effect.tryPromise({
              try: async () =>
                await (
                  <PostsPage theme={theme} pathname={pathname} posts={posts} />
                ),
              catch: () =>
                createHttpError(
                  500,
                  "An error occurred while rendering the posts page.",
                ),
            }),
          );

          return new Response(html, {
            headers: {
              "Content-Type": "text/html",
            },
          });
        }

        const postsMatch = pathname.match(/^\/posts\/([a-z\-]+)(\/(.+))?$/);
        const postName = Option.fromNullable(postsMatch?.[1]);
        const postResource = Option.fromNullable(postsMatch?.[3]);

        if (Option.isSome(postName)) {
          const name = postName.value;

          if (Option.isSome(postResource)) {
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
            renderMarkdown(post.content, { pathname }),
            Effect.mapError(inner =>
              createHttpError(
                500,
                "An error occurred while rendering the markdown content.",
                { post: post.name, inner },
              ),
            ),
          );

          const html = yield* _(
            Effect.tryPromise({
              try: async () =>
                await (
                  <PostPage
                    theme={theme}
                    pathname={pathname}
                    post={{ ...post, content }}
                  />
                ),
              catch: () =>
                createHttpError(
                  500,
                  "An error occurred while rendering the post page.",
                ),
            }),
          );

          return new Response(html, {
            headers: {
              "Content-Type": "text/html",
            },
          });
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
    // try {
    //   const cookies: Record<string, string> = Object.fromEntries(
    //     (request.headers.get("Cookie") || "")
    //       .split("; ")
    //       .map(x => x.split("="))
    //       .filter(x => x.length === 2),
    //   );
    //   const theme = Theme.parse(cookies["theme"])
    //     ? cookies["theme"]
    //     : Theme.defaultOption;
    //   if (/^get$/i.test(request.method)) {
    //     if (pathname === "/") {
    //       return new Response(
    //         await(<HomePage pathname={pathname} theme={theme} />),
    //         {
    //           headers: {
    //             "Content-Type": "text/html",
    //           },
    //         },
    //       );
    //     }
    //     if (pathname === "/posts") {
    //       return new Response(
    //         await(<PostsPage pathname={pathname} theme={theme} />),
    //         {
    //           headers: {
    //             "Content-Type": "text/html",
    //           },
    //         },
    //       );
    //     }
    //     if (/\/posts\/[^\/]+/.test(pathname)) {
    //       const name = pathname.replace(/^\/posts\//, "");
    //       return new Response(
    //         await(<PostPage name={name} pathname={pathname} theme={theme} />),
    //         {
    //           headers: {
    //             "Content-Type": "text/html",
    //           },
    //         },
    //       );
    //     }
    //   }
    //   try {
    //     return await getAssetFromKV(
    //       {
    //         request,
    //         waitUntil: ctx.waitUntil.bind(ctx),
    //       },
    //       {
    //         ASSET_NAMESPACE: env.__STATIC_CONTENT,
    //         ASSET_MANIFEST: assetManifest,
    //       },
    //     );
    //   } catch {
    //     throw createHttpError(404, `No resource was found at "${pathname}".`);
    //   }
    // } catch (e) {
    //   if (e instanceof HttpError && e.expose) {
    //     return new Response(e.message, { status: e.status });
    //   }
    //   console.error(e);
    //   return new Response(
    //     "I'm sorry, but I'm unable to fulfill your request due to an error. It's not your fault. Please try again.",
    //     { status: 500 },
    //   );
    // }
  },
};
