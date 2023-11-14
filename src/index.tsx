import { Html } from "@kitajs/html";
import { getAssetFromKV } from "@cloudflare/kv-asset-handler";
import createHttpError, { HttpError } from "http-errors";
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

// load wasm outside of `fetch` so it can be reused
await loadWasm(obj => WebAssembly.instantiate(wasm, obj));

type Environment = {
  __STATIC_CONTENT: unknown;
};

export default {
  async fetch(request: Request, env: Environment, ctx: ExecutionContext) {
    const { pathname } = new URL(request.url);
    try {
      if (pathname === "/theme" && /^post$/i.test(request.method)) {
        const formData = await request.formData();
        if (!formData.has("theme")) {
          throw createHttpError(400, "You must specify a theme.");
        }
        const theme = formData.get("theme");
        if (Theme.parse(theme)) {
          return new Response(await (<ThemeSwitcher theme={theme} />), {
            headers: {
              "Content-Type": "text/html",
              "Set-Cookie": `theme=${theme}; Max-Age: ${/*1 year*/ 31558464}`,
            },
          });
        } else {
          throw createHttpError(
            400,
            `The provided theme "${theme}" was not one of the supported options: ${Theme.options
              .map(x => `"${x}"`)
              .join(", ")}`,
          );
        }
      }
      const cookies: Record<string, string> = Object.fromEntries(
        (request.headers.get("Cookie") || "")
          .split("; ")
          .map(x => x.split("="))
          .filter(x => x.length === 2),
      );
      const theme = Theme.parse(cookies["theme"])
        ? cookies["theme"]
        : Theme.defaultOption;
      if (/^get$/i.test(request.method)) {
        if (pathname === "/") {
          return new Response(
            await (<HomePage pathname={pathname} theme={theme} />),
            {
              headers: {
                "Content-Type": "text/html",
              },
            },
          );
        }
        if (pathname === "/posts") {
          return new Response(
            await (<PostsPage pathname={pathname} theme={theme} />),
            {
              headers: {
                "Content-Type": "text/html",
              },
            },
          );
        }
        if (/\/posts\/[^\/]+/.test(pathname)) {
          const name = pathname.replace(/^\/posts\//, "");
          return new Response(
            await (<PostPage name={name} pathname={pathname} theme={theme} />),
            {
              headers: {
                "Content-Type": "text/html",
              },
            },
          );
        }
      }
      try {
        return await getAssetFromKV(
          {
            request,
            waitUntil: ctx.waitUntil.bind(ctx),
          },
          {
            ASSET_NAMESPACE: env.__STATIC_CONTENT,
            ASSET_MANIFEST: assetManifest,
          },
        );
      } catch {
        throw createHttpError(404, `No resource was found at "${pathname}".`);
      }
    } catch (e) {
      if (e instanceof HttpError && e.expose) {
        return new Response(e.message, { status: e.status });
      }
      console.error(e);
      return new Response(
        "I'm sorry, but I'm unable to fulfill your request due to an error. It's not your fault. Please try again.",
        { status: 500 },
      );
    }
  },
};
