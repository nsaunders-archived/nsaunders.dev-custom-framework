import { Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import matter from "gray-matter";

const DateT = Type.Transform(Type.String())
  .Decode(s => new Date(s))
  .Encode(d => d.toISOString());

const schema = Type.Array(
  Type.Object({
    name: Type.String(),
    title: Type.String(),
    description: Type.String(),
    published: DateT,
    tags: Type.Array(Type.String()),
    readingTime: Type.Number(),
  }),
);

export async function list() {
  const res = await fetch(
    "https://raw.githubusercontent.com/nsaunders/writing/master/posts/index.json",
  );
  const json = await res.json();
  return Value.Decode(schema, json);
}

export async function getByName(name: string) {
  const [post, markdown] = await Promise.all([
    list().then(posts => posts.find(p => p.name === name)),
    fetch(
      `https://raw.githubusercontent.com/nsaunders/writing/master/posts/${name}/index.md`,
    ).then(res => (res.ok ? res.text() : undefined)),
  ]);
  if (!(post && markdown)) {
    return undefined;
  }
  const { content } = matter(markdown);
  return {
    ...post,
    baseHref: `https://github.com/nsaunders/writing/raw/master/posts/${name}/`,
    content,
  };
}
