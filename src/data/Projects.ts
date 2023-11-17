import * as cheerio from "cheerio";
import { Data, Effect, Option, Request, RequestResolver } from "effect";
import * as S from "@effect/schema/Schema";

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

interface ListProjectsError extends Data.Case {
  readonly _tag: "ListProjectsError";
}

const ListProjectsError = Data.tagged<ListProjectsError>("ListProjectsError");

interface ListProjects extends Request.Request<ListProjectsError, Projects> {
  readonly _tag: "ListProjects";
}

const ListProjects = Request.tagged<ListProjects>("ListProjects");

const ListProjectsResolver = RequestResolver.fromEffect((_: ListProjects) =>
  Effect.gen(function* (_) {
    const html = yield* _(
      Effect.tryPromise({
        try: () =>
          fetch(`https://github.com/${username}`).then(res => res.text()),
        catch: () => ListProjectsError(),
      }),
    );

    const data = yield* _(
      Effect.try({
        try: () => {
          const $ = cheerio.load(html);
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
        catch: () => ListProjectsError(),
      }),
    );

    return yield* _(
      Effect.orElseFail(S.parse(Projects)(data), () => ListProjectsError()),
    );
  }),
);

export const list = () =>
  Effect.request(ListProjects({}), ListProjectsResolver);

interface GetProjectStoryError extends Data.Case {
  readonly _tag: "GetProjectStoryError";
}

const GetProjectStoryError = Data.tagged<GetProjectStoryError>(
  "GetProjectStoryError",
);

interface GetProjectStory
  extends Request.Request<GetProjectStoryError, Option.Option<string>> {
  readonly _tag: "GetProjectStory";
  owner: string;
  name: string;
}

const GetProjectStory = Request.tagged<GetProjectStory>("GetProjectStory");

const GetProjectStoryResolver = RequestResolver.fromEffect(
  ({ owner, name }: GetProjectStory) =>
    Effect.gen(function* (_) {
      const response = yield* _(
        Effect.tryPromise({
          try: () =>
            fetch(
              `https://raw.githubusercontent.com/nsaunders/writing/master/projects/${owner}/${name}.md`,
            ),
          catch: () => GetProjectStoryError(),
        }),
      );
      if (response.status === 404) {
        return Option.none<string>();
      }
      return yield* _(
        Effect.tryPromise(() => response.text()),
        Effect.map(Option.some),
        Effect.orElseFail(() => GetProjectStoryError()),
      );
    }),
);

const getStory = (params: { owner: string; name: string }) =>
  Effect.request(GetProjectStory(params), GetProjectStoryResolver);

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
