import { format } from "date-fns";

export type Props = {
  children: number;
};

export default function FormatReadingTime({ children }: Props) {
  return <>{Math.ceil(children / 60000)} min read</>;
}
