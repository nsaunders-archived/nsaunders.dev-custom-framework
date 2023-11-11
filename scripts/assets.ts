import fs from "fs/promises";
import path from "path";
import * as CSS from "lightningcss";

const assets = path.resolve(import.meta.dir, "..", "assets");

await fs.mkdir(assets, { recursive: true });

// Copy HTMX library
await Bun.write(
  path.join(assets, "htmx.js"),
  Bun.file(require.resolve("htmx.org")),
);

// Prepare CSS
await Promise.all(
  Object.entries({
    "normalize.css": require.resolve("modern-normalize"),
    "onest.css": require.resolve("@fontsource-variable/onest"),
    "montserrat.css": require.resolve("@fontsource-variable/montserrat"),
    "inconsolata.css": require.resolve("@fontsource-variable/inconsolata"),
    "prism.css": require.resolve("prism-theme-vars/base.css"),
  }).map(async ([filename, source]) => {
    const { code, map } = await CSS.transform({
      filename,
      code: await fs.readFile(source),
      minify: true,
      sourceMap: true,
    });

    await Bun.write(path.join(assets, filename), code);
    if (map) {
      await Bun.write(path.join(assets, `${filename}.map`), map);
    }
  }),
);

await fs.mkdir(path.join(assets, "files"), { recursive: true });

// Copy font dependencies
await Promise.all(
  ["onest", "montserrat", "inconsolata"].map(async pkg => {
    const files = path.join(
      path.dirname(require.resolve(`@fontsource-variable/${pkg}`)),
      "files",
    );
    const list = await fs.readdir(files);
    return await Promise.all(
      list.map(async file =>
        Bun.write(
          path.join(assets, "files", file),
          await fs.readFile(path.join(files, file)),
        ),
      ),
    );
  }),
);
