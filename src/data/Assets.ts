import { Context, Data, Effect, pipe } from "effect";
import { HttpClient as Http } from "@effect/platform-browser";

// @ts-ignore
import manifestJSON from "__STATIC_CONTENT_MANIFEST";
import { getAssetFromKV } from "@cloudflare/kv-asset-handler";
const assetManifest = JSON.parse(manifestJSON);

export interface Assets {
  fetch(
    pathname: string,
  ): Effect.Effect<never, GetAssetError, Http.response.ClientResponse>;
}

export const Assets = Context.Tag<Assets>();

export interface GetAssetError extends Data.Case {
  readonly _tag: "GetAssetError";
}

const GetAssetError = Data.tagged<GetAssetError>("GetAssetError");

export function createAssets(
  env: { __STATIC_CONTENT: unknown },
  waitUntil: (promise: Promise<unknown>) => void,
): Assets {
  return {
    fetch(pathname) {
      const request = new Request("http://." + pathname);
      return pipe(
        Effect.tryPromise({
          try: () =>
            getAssetFromKV(
              {
                request,
                waitUntil,
              },
              {
                ASSET_NAMESPACE: env.__STATIC_CONTENT,
                ASSET_MANIFEST: assetManifest,
              },
            ).then(response =>
              Http.response.fromWeb(
                Http.request.make("GET")(request.url),
                response,
              ),
            ),
          catch: () => GetAssetError(),
        }),
        Effect.flatMap(response => {
          if (response.status === 200) {
            return Effect.succeed(response);
          }
          return Effect.fail(GetAssetError());
        }),
      );
    },
  };
}
