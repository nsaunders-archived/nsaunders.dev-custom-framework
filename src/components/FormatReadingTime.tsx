import { Html } from "@kitajs/html";

export type Props = {
  children: number;
};

export default function FormatReadingTime({ children }: Props) {
  return <>{Math.ceil(children / 60000)} min read</>;
}
