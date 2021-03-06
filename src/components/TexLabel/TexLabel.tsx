import TeX from "@matejmazur/react-katex";
import "katex/dist/katex.min.css";
import React, { FC } from "react";
const style = { fontSize: "12px" };
export default React.memo<{
  x: number;
  y: number;
  dx?: number;
  dy?: number;
  rotate?: number;
  latexstring: string;
}>(({ x, y, dx = 0, dy = 0, rotate = 0, latexstring = "" }) => (
  <foreignObject
    width="60"
    height="50"
    transform={`translate(${x}, ${y}) rotate(${rotate}) translate(${dx},${dy})`}
  >
    <span style={style}>
      <TeX math={latexstring} />
    </span>
  </foreignObject>
));
