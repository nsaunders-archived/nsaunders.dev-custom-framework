export type Props = {
  title?: JSX.ElementChildrenAttribute["children"];
} & JSX.ElementChildrenAttribute;

export default function ListLayout({ children, title }: Props) {
  return (
    <section style={{ display: "flex", flexDirection: "column" }}>
      {title ? (
        <h1
          style={{
            margin: 0,
            fontSize: "2rem",
            marginBottom: "0.5em",
            fontWeight: 400,
          }}
        >
          {title}
        </h1>
      ) : undefined}
      {children}
    </section>
  );
}
