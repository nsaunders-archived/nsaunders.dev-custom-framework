import { Context, Data, Effect, Either, identity, pipe } from "effect";
import { HttpClient as Http } from "@effect/platform-browser";

// @ts-ignore
import manifestJSON from "__STATIC_CONTENT_MANIFEST";
import { getAssetFromKV } from "@cloudflare/kv-asset-handler";
const assetManifest = JSON.parse(manifestJSON);

export interface Asset {
  get(
    pathname: string,
  ): Effect.Effect<never, GetAssetError, Http.response.ClientResponse>;
}

export const Asset = Context.Tag<Asset>();

export interface GetAssetError extends Data.Case {
  readonly _tag: "GetAssetError";
  readonly pathname: string;
  readonly result: Either.Either<string, number>;
}

const GetAssetError = Data.tagged<GetAssetError>("GetAssetError");

export function printGetAssetError(error: GetAssetError) {
  return `Failed to retrieve asset ${error.pathname}. ${Either.match(
    error.result,
    {
      onLeft: identity,
      onRight: status => `Unexpected response status ${status}.`,
    },
  )}`;
}

export function createAsset(
  env: { __STATIC_CONTENT: unknown },
  waitUntil: (promise: Promise<unknown>) => void,
): Asset {
  return {
    get(pathname) {
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
          catch: error =>
            GetAssetError({
              pathname,
              result:
                error &&
                typeof error === "object" &&
                "message" in error &&
                typeof error.message === "string"
                  ? Either.left(error.message)
                  : Either.left("Unknown request failure."),
            }),
        }),
        Effect.flatMap(response => {
          if (response.status === 200) {
            return Effect.succeed(response);
          }
          return Effect.fail(
            GetAssetError({
              pathname,
              result: Either.right(response.status),
            }),
          );
        }),
      );
    },
  };
}
