import { html } from "@elysiajs/html";
import staticPlugin from "@elysiajs/static";
import { Elysia, t } from "elysia";
import * as Theme from "./data/Theme";
import ThemeSwitcher from "./components/ThemeSwitcher";
import HomePage from "./components/HomePage";
import PostsPage from "./components/PostsPage";
import ProjectsPage from "./components/ProjectsPage";
import AboutPage from "./components/AboutPage";
import PostPage from "./components/PostPage";

const app = (
  process.env.NODE_ENV !== "production"
    ? new Elysia().ws("/development", {})
    : new Elysia()
)
  .state(
    "environment",
    process.env.NODE_ENV === "production"
      ? ("production" as const)
      : ("development" as const),
  )
  .use(html())
  .use(staticPlugin({ assets: "assets", prefix: "assets" }))
  .guard({
    cookie: t.Cookie({
      themePreference: t.Optional(Theme.schema),
    }),
  })
  .post(
    "/theme",
    async ({ body, cookie }) => {
      const { theme } = body;
      cookie.themePreference.value = theme;
      return <ThemeSwitcher theme={theme} />;
    },
    {
      body: t.Object({
        theme: Theme.schema,
      }),
    },
  )

  .get("/", ctx => <HomePage {...ctx} />)
  .get("/posts", ctx => <PostsPage {...ctx} />)
  .get("/posts/:name", ctx => <PostPage {...ctx} />)
  .get("/posts/:name/*", ({ params, set }) => {
    set.status = 302;
    set.headers[
      "location"
    ] = `https://github.com/nsaunders/writing/raw/master/posts/${params.name}/${params["*"]}`;
  })
  .get("/projects", ctx => <ProjectsPage {...ctx} />)
  .get("/about", ctx => <AboutPage {...ctx} />)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
