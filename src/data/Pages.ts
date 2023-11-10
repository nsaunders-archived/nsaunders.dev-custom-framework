export async function getByName(name: string) {
  const res = await fetch(
    `https://raw.githubusercontent.com/nsaunders/writing/master/pages/${name}/index.md`,
  );
  return {
    name,
    content: await res.text(),
  };
}
