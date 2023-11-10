import * as cheerio from "cheerio";

const username = "nsaunders";

export async function list() {
  const res = await fetch(`https://github.com/${username}`);
  if (!res.ok) {
    throw new Error(`Unexpected ${res.status} response: ${res.statusText}`);
  }
  const html = await res.text();
  const $ = cheerio.load(html);
  return $(".pinned-item-list-item-content")
    .map(function () {
      const owner: string = $(this).find("a .owner").text().trim() || username;
      const name: string = $(this).find("a .repo").text().trim();
      const description: string = $(this)
        .find(".pinned-item-desc")
        .text()
        .trim();
      const languageColor =
        $(this).find(".repo-language-color").css("background-color") ||
        "var(--black)";
      const languageName = $(this)
        .find("[itemProp='programmingLanguage']")
        .text()
        .trim();
      const stars =
        parseInt($(this).find("a[href$='stargazers']").text().trim()) || 0;
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
}

async function getStory({
  owner,
  name,
}: Awaited<ReturnType<typeof list>>[number]) {
  const res = await fetch(
    `https://raw.githubusercontent.com/nsaunders/writing/master/projects/${owner}/${name}.md`,
  );
  if (res.ok) {
    return await res.text();
  }
  return null;
}

export async function getFeatured() {
  const projects = await list();
  for (const project of projects) {
    const story = await getStory(project);
    if (story) {
      return { ...project, story };
    }
  }
  return null;
}
