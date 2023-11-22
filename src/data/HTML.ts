import { Assets } from "./Assets";
import * as HTML from "@nsaunders/html";
import { Data, Effect, pipe } from "effect";
import { html as htmlToVNode } from "satori-html";
import satori from "satori/wasm";
import { Resvg } from "@resvg/resvg-wasm";

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
    weight: number;
  };
  RenderImageHTMLToVNodeError: { message: string };
  RenderImageVNodeToSVGError: { message: string };
  RenderImageSVGToPNGError: { message: string };
}>;

const {
  RenderImageGetFontError,
  RenderImageHTMLToVNodeError,
  RenderImageVNodeToSVGError,
  RenderImageSVGToPNGError,
} = Data.taggedEnum<RenderImageError>();

export const renderImage = (
  jsx: JSX.Element,
  options: { width: number; height: number },
) =>
  pipe(
    Effect.all([
      Assets.pipe(
        Effect.flatMap(assets =>
          Effect.all(
            ([400, 700] as const).map(weight =>
              pipe(
                assets.fetch(`/files/onest-latin-${weight}-normal.woff`),
                Effect.flatMap(res => res.arrayBuffer),
                Effect.mapBoth({
                  onFailure: () => RenderImageGetFontError({ weight }),
                  onSuccess: data =>
                    ({
                      name: "Onest",
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
          RenderImageHTMLToVNodeError(
            e instanceof Error ? e : { message: "Unknown failure" },
          ),
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
          RenderImageVNodeToSVGError(
            e instanceof Error ? e : { message: "Unknown failure" },
          ),
      }),
    ),
    Effect.flatMap(svg =>
      Effect.try({
        try: () => new Resvg(svg).render().asPng(),
        catch: e =>
          RenderImageSVGToPNGError(
            e instanceof Error ? e : { message: "Unknown failure" },
          ),
      }),
    ),
  );
