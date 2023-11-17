import * as cheerio from "cheerio";
import { Effect, Option } from "effect";
import * as S from "@effect/schema/Schema";
import { HttpClient as Http } from "@effect/platform-browser";
import { GeneralParseError } from "./errors";

const username = "nsaunders";

const Projects = S.array(
  S.struct({
    url: S.string,
    owner: S.string,
    name: S.string,
    description: S.string,
    language: S.struct({ name: S.string, color: S.string }),
    stars: S.Int,
    forks: S.Int,
  }),
);

export type Projects = S.Schema.To<typeof Projects>;

export const list = () =>
  Http.request.get(`https://github.com/${username}`).pipe(
    Http.client.fetchOk(),
    Effect.flatMap(res => res.text),
    Effect.flatMap(input =>
      Effect.try({
        try() {
          const $ = cheerio.load(input);
          return $(".pinned-item-list-item-content")
            .map(function () {
              const owner: string =
                $(this).find("a .owner").text().trim().replace(/\/$/, "") ||
                username;
              const name: string = $(this).find("a .repo").text().trim();
              const description: string = $(this)
                .find(".pinned-item-desc")
                .text()
                .trim();
              const languageColor =
                $(this).find(".repo-language-color").css("background-color") ||
                "black";
              const languageName = $(this)
                .find("[itemProp='programmingLanguage']")
                .text()
                .trim();
              const stars =
                parseInt($(this).find("a[href$='stargazers']").text().trim()) ||
                0;
              const forks =
                parseInt($(this).find("a[href$='forks']").text().trim()) || 0;
              return {
                url: `https://github.com/${owner}/${name}`,
                owner,
                name,
                description,
                language: { name: languageName, color: languageColor },
                stars,
                forks,
              };
            })
            .toArray();
        },
        catch(e) {
          return GeneralParseError({
            input,
            message: e instanceof Error ? e.message : "Unknown failure",
          });
        },
      }),
    ),
    Effect.flatMap(S.parse(Projects)),
  );

const getStory = ({ owner, name }: { owner: string; name: string }) =>
  Http.request
    .get(
      `https://raw.githubusercontent.com/nsaunders/writing/master/projects/${owner}/${name}.md`,
    )
    .pipe(
      Http.client.fetch(),
      Effect.flatMap(res => {
        switch (res.status) {
          case 404:
            return Effect.succeed(Option.none());
          default:
            return Effect.map(res.text, Option.some);
        }
      }),
    );

export type FeaturedProject = Projects[number] & { story: string };

export const getFeatured = () =>
  Effect.gen(function* (_) {
    const projects = yield* _(list());
    for (const project of projects) {
      const story = yield* _(getStory(project));
      if (Option.isSome(story)) {
        return Option.some({ ...project, story: story.value });
      }
    }
    return Option.none();
  });
