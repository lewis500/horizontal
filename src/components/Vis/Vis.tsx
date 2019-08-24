import React, {
  useContext,
  useRef,
} from "react";
import * as ducks from "src/ducks";
import useElementSize from "src/useElementSizeHook";
import makeStyles from "@material-ui/styles/makeStyles";
import * as colors from "@material-ui/core/colors";

const EMPTY = {};
export default () => {
  const { state } = useContext(ducks.AppContext),
    classes = useStyles(EMPTY),
    containerRef = useRef<HTMLDivElement>(),
    { width, height } = useElementSize(containerRef);

  return (
    <div ref={containerRef} className={classes.container}>
      <svg className={classes.svg}>
        <circle
          r={ducks.getRoadPoints(state, { width, height }).r}
          cx={ducks.getRoadPoints(state, { width, height }).center[0]}
          cy={ducks.getRoadPoints(state, { width, height }).center[1]}
          className={classes.circle}
        />
        <path
          d={ducks.getHinge(state, { width, height })}
          className={classes.hinge}
        />
        <path
          d={ducks.getRoadSides(state, { width, height })}
          className={classes.sides}
        />
        <path
          d={ducks.getRoadArc(state, { width, height })}
          className={classes.arc}
        />
        <rect
          className={classes.car}
          width={6}
          height={4}
          transform={`translate(${
            ducks.getCar(state, { width, height }).loc
          }) rotate(${
            ducks.getCar(state, { width, height }).rotate
          }) translate(${-6},${-2})`}
        />
      </svg>
    </div>
  );
};

const useStyles = makeStyles({
  laser: {
    fill: "none",
    "stroke-width": 6,
    "stroke-linecap": "round"
  },
  sides: {
    extend: "laser",
    stroke: colors.grey["800"]
  },
  arc: {
    extend: "laser",
    stroke: colors.lightBlue["700"]
  },
  circle: {
    extend: "laser",
    strokeWidth: "1px",
    stroke: colors.pink["A700"],
    strokeDasharray: "2,3"
  },
  hinge: {
    extend: "laser",
    stroke: colors.pink["A700"],
    fill: "none",
    strokeWidth: "1px",
    strokeDasharray: "2,3"
    // strokeWidth: 2
  },
  svg: {
    display: "block",
    width: "100%",
    height: "100%",
    "& text": {
      fontFamily: "Puritan, san-serif",
      fontSize: "13px"
    }
  },
  container: {
    position: "relative",
    width: "100%",
    height: "100%"
  },
  tangent: {
    stroke: colors.pink["A700"],
    strokeWidth: "2px",
    fill: "none"
  },
  connected: {
    stroke: colors.pink["A200"],
    strokeDasharray: "2, 2"
  },
  text: {
    textAlign: "center",
    fontSize: "12px",
    fontFamily: "Puritan, sans-serif"
  },
  car: {
    fill: colors.purple["200"],
    stroke: "white",
    rx: 1,
    ry: 1
  },
  block: {
    fill: colors.green["A700"]
  }
});
