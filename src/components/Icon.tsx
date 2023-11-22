import * as V from "varsace";

export const fonts = [["montserrat", 400]] as const;

export type Props = {
  width: number;
  height: number;
};

export default function ({ width, height }: Props) {
  return (
    <div
      style={{
        fontSize: `${height * 0.75}px`,
        background: `linear-gradient(0,${V.blue40},${V.blue60})`,
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: V.white,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: `${height * 0.5}px`,
          left: `${width * -4}px`,
          width: `${width * 9}px`,
          height: `${height * 9}px`,
          background: V.blue80,
          borderRadius: "9999px",
          color: "transparent",
        }}
      >
        _
      </div>
      N
      <div
        style={{
          position: "absolute",
          width: `${width}px`,
          height: `${height}px`,
          top: 0,
          left: 0,
          boxShadow: `inset 0 0 0 1px ${V.blue50}`,
          color: "transparent",
        }}
      >
        _
      </div>
    </div>
  );
}
