import React, { useContext, useCallback, useMemo } from "react";
import { withStyles, Theme } from "@material-ui/core/styles";
import { AppContext, ActionTypes } from "src/ducks";
import Slider, { SliderProps } from "@material-ui/core/Slider";
import { Typography as Text, colors } from "@material-ui/core";
import makeStyles from "@material-ui/styles/makeStyles";
import TeX from "@matejmazur/react-katex";
import * as params from "src/constants";
import "katex/dist/katex.min.css";
import { createSelector } from "reselect";

const StyleSlider = withStyles((theme: Theme) => ({
  root: {
    color: theme.palette.primary.main,
    marginBottom: "15px"
  }
}))(Slider);

export default () => {
  const { state, dispatch } = useContext(AppContext);
  const cbs = useMemo(
    () =>
      ({
        setΔ: (e, payload) => dispatch({ type: ActionTypes.SET_Δ, payload }),
        setR: (e, payload) => dispatch({ type: ActionTypes.SET_R, payload }),
        setX: (e, payload) => dispatch({ type: ActionTypes.SET_X, payload })
      } as { [key: string]: (e: React.ChangeEvent<{}>, v: number) => void }),
    []
  );
  // const { l, v0, g1, g2, x } = state;
  return (
    <>
      <Text variant="body1">
        <TeX math="\Delta" /> angle
      </Text>
      <StyleSlider
        onChange={cbs.setΔ}
        value={state.Δ}
        step={1}
        min={0}
        max={75}
      />
      <Text variant="body1">
        <TeX math="R" /> radius
      </Text>
      <StyleSlider
        onChange={cbs.setR}
        value={state.R}
        step={1}
        min={20}
        max={90}
      />
      <Text variant="body1">
        <TeX math="x" /> radius
      </Text>
      <StyleSlider
        onChange={cbs.setX}
        value={state.x}
        step={1}
        min={0}
        max={params.W * 1.4}
      />
      {/* {g1Text}
      <StyleSlider
        onChange={(e, payload: number) => dispatch({ type: "SET_G1", payload })}
        value={g1}
        step={0.01}
        min={0}
        max={0.4}
      />
      {g2Text}
      <StyleSlider
        onChange={(e, payload: number) => dispatch({ type: "SET_G2", payload })}
        value={g2}
        step={0.01}
        min={-0.3}
        max={0.1}
      />
      {lText}
      <StyleSlider
        onChange={(e, payload: number) => dispatch({ type: "SET_L", payload })}
        value={l}
        step={1}
        min={0}
        max={params.total}
      /> */}
    </>
  );
};
