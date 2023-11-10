import { O } from "ts-toolbelt";
import Page from "./Page";

export default function (
  pageProps: O.Omit<Parameters<typeof Page>[0], "children">,
) {
  return (
    <Page {...pageProps}>
      <div>About me</div>
    </Page>
  );
}
