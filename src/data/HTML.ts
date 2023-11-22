import { Data, Effect, Match, Option, pipe } from "effect";
import { HttpClient as Http } from "@effect/platform-browser";
import { html as htmlToVNode } from "satori-html";
import satori from "satori/wasm";
import { Resvg } from "@resvg/resvg-wasm";
import * as HTML from "@nsaunders/html";
import { Asset, GetAssetError, printGetAssetError } from "./Asset";

// @ts-ignore
import yogaWasm from "../../node_modules/yoga-wasm-web/dist/yoga.wasm";
import initYoga from "yoga-wasm-web";
import * as Satori from "satori/wasm";
initYoga(yogaWasm).then(Satori.init);

// @ts-ignore
import resvgWasm from "../../node_modules/@resvg/resvg-wasm/index_bg.wasm";
import { initWasm } from "@resvg/resvg-wasm";
initWasm(resvgWasm);

export const render = HTML.render;

type RenderImageError = Data.TaggedEnum<{
  RenderImageGetFontError: {
    family: string;
    weight: number;
    cause: Http.error.ResponseError | GetAssetError;
  };
  RenderImageHTMLToVNodeError: { cause: Option.Option<Error> };
  RenderImageVNodeToSVGError: { cause: Option.Option<Error> };
  RenderImageSVGToPNGError: { cause: Option.Option<Error> };
}>;

const {
  RenderImageGetFontError,
  RenderImageHTMLToVNodeError,
  RenderImageVNodeToSVGError,
  RenderImageSVGToPNGError,
} = Data.taggedEnum<RenderImageError>();

export const printRenderImageError = Match.type<RenderImageError>().pipe(
  Match.tag(
    "RenderImageGetFontError",
    ({ family, weight, cause }) =>
      `Unable to retrieve font ${family}/${weight} while rendering the image. ${pipe(
        cause,
        Match.type<Http.error.ResponseError | GetAssetError>().pipe(
          Match.tag(
            "ResponseError",
            ({ reason }) => `Encountered a response error (${reason}).`,
          ),
          Match.tag("GetAssetError", printGetAssetError),
          Match.exhaustive,
        ),
      )}`,
  ),
  Match.tag(
    "RenderImageHTMLToVNodeError",
    ({ cause }) =>
      `Unable to convert HTML to VNode.${pipe(
        cause,
        Option.map(e => ` ${e.message}`),
        Option.getOrElse(() => ""),
      )}`,
  ),
  Match.tag(
    "RenderImageVNodeToSVGError",
    ({ cause }) =>
      `Unable to convert VNode to SVG.${pipe(
        cause,
        Option.map(e => ` ${e.message}`),
        Option.getOrElse(() => ""),
      )}`,
  ),
  Match.tag(
    "RenderImageSVGToPNGError",
    ({ cause }) =>
      `Unable to convert SVG to PNG.${pipe(
        cause,
        Option.map(e => ` ${e.message}`),
        Option.getOrElse(() => ""),
      )}`,
  ),
  Match.exhaustive,
);

export const renderImage = (
  jsx: JSX.Element,
  options: {
    width: number;
    height: number;
    fonts: readonly (
      | readonly ["onest", 400 | 700]
      | readonly ["montserrat", 400]
    )[];
  },
) =>
  pipe(
    Effect.all([
      Asset.pipe(
        Effect.flatMap(asset =>
          Effect.all(
            options.fonts.map(([family, weight]) =>
              pipe(
                asset.get(`/files/${family}-latin-${weight}-normal.woff`),
                Effect.flatMap(res => res.arrayBuffer),
                Effect.mapBoth({
                  onFailure: cause =>
                    RenderImageGetFontError({ weight, family, cause }),
                  onSuccess: data =>
                    ({
                      name: family.replace(/^[a-z]/, x => x.toUpperCase()),
                      weight,
                      style: "normal",
                      data,
                    } as const),
                }),
              ),
            ),
          ),
        ),
      ),
      Effect.try({
        try: () => htmlToVNode(HTML.render(jsx)),
        catch: e =>
          RenderImageHTMLToVNodeError({
            cause: e instanceof Error ? Option.some(e) : Option.none(),
          }),
      }),
    ]),
    Effect.flatMap(([fonts, vnode]) =>
      Effect.tryPromise({
        try: () =>
          satori(vnode, {
            ...options,
            fonts,
          }),
        catch: e =>
          RenderImageVNodeToSVGError({
            cause: e instanceof Error ? Option.some(e) : Option.none(),
          }),
      }),
    ),
    Effect.flatMap(svg =>
      Effect.try({
        try: () => new Resvg(svg).render().asPng(),
        catch: e =>
          RenderImageSVGToPNGError({
            cause: e instanceof Error ? Option.some(e) : Option.none(),
          }),
      }),
    ),
  );
