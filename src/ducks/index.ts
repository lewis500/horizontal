import React, { Dispatch } from "react";
import * as params from "src/constants";
import mo from "memoize-one";
import { createSelector as CS } from "reselect";
import get from "lodash/fp/get";
import { scaleLinear, ScaleLinear } from "d3-scale";
import clsx from "clsx";

type NN = number;

export const initialState = {
  play: false,
  x: 40,
  v: 18,
  v0: 18,
  time: 0,
  R: 90,
  Δ: 40
};
type Mapper = (v: NN) => NN;

export enum ActionTypes {
  TICK = "TICK",
  SET_V0 = "SET_V0",
  SET_R = "SET_R",
  SET_PLAY = "SET_PLAY",
  RESET = "RESET",
  RESTART = "RESTART",
  SET_Δ = "SET_Δ",
  SET_X = "SET_X"
}

export type State = typeof initialState;

type Action =
  | {
      type: ActionTypes.TICK;
      payload: NN;
    }
  | { type: ActionTypes.SET_V0; payload: NN }
  | { type: ActionTypes.SET_X; payload: NN }
  | { type: ActionTypes.SET_Δ; payload: NN }
  | { type: ActionTypes.SET_R; payload: NN }
  | { type: ActionTypes.RESTART }
  | { type: ActionTypes.RESET }
  | { type: ActionTypes.SET_PLAY; payload: boolean };

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case ActionTypes.TICK:
      // let connected = getConnected(state);
      let connected = false;
      let dt = action.payload;
      return {
        ...state,
        v: !connected ? state.v0 : state.v - dt * params.a,
        x: state.x + dt * state.v + (connected ? -dt * dt * params.a * 0.5 : 0),
        time: state.time + dt
      };
    case ActionTypes.SET_Δ:
      return {
        ...state,
        Δ: action.payload
      };
    case ActionTypes.SET_X:
      return {
        ...state,
        x: action.payload
      };
    case ActionTypes.SET_PLAY:
      return {
        ...state,
        play: action.payload
      };
    case ActionTypes.SET_V0:
      return {
        ...state,
        v0: action.payload
      };
    case ActionTypes.SET_R:
      return {
        ...state,
        R: action.payload
      };
    case ActionTypes.RESTART:
      return {
        ...state,
        time: 0,
        x: 0,
        v: state.v0
      };
    case ActionTypes.RESET:
      return {
        ...state,
        play: false,
        time: 0,
        x: 0,
        v: state.v0
      };
    default:
      return state;
  }
};

export const getΔ2Rad = CS<State, NN, NN>(
    [get("Δ")],
    Δ => ((Δ / 180) * Math.PI) / 2
  ),
  getChord = CS<State, NN, NN, NN>(
    [get("R"), getΔ2Rad],
    (R, Δ2) => 2 * R * Math.sin(Δ2)
  ),
  getXScale = CS<
    State,
    { width: number; height: number },
    number,
    ScaleLinear<number, number>
  >([(_, props) => props.width], width =>
    scaleLinear()
      .domain([0, params.W])
      .range([0, width])
  ),
  getYScale = CS(
    [getXScale, (_, { height }) => height],
    (xScale, height) => (v: number) => height - xScale(v + params.y0)
  ),
  getRoadPointsRaw = CS([getΔ2Rad, get("R")], (Δ2, R) => {
    let chord = 2 * R * Math.sin(Δ2);
    let side = (params.W - chord) / 2;
    let yKink = Math.tan(Δ2) * side;
    return {
      a: [0, 0],
      b: [side, yKink],
      c: [side + chord, yKink],
      d: [params.W, 0],
      r: R,
      center: [params.W / 2, yKink - Math.cos(Δ2) * R],
      side,
      pvi: [params.W / 2, (params.W / 2) * Math.tan(Δ2)]
    };
  }),
  getRoadPoints = CS(
    [getRoadPointsRaw, getXScale, getYScale],
    ({ a, b, c, d, r, center, pvi }, xScale, yScale) => {
      const cp = ([m, n]: number[]) => [xScale(m), yScale(n)];
      return {
        a: cp(a),
        b: cp(b),
        c: cp(c),
        d: cp(d),
        r: xScale(r),
        center: cp(center),
        pvi: cp(pvi)
      };
    }
  ),
  getRoadArc = CS(
    [getRoadPoints, get("R"), getXScale],
    ({ a, b, c, d, r }) => "M" + b + `A ${r} ${r} 0 0 1 ${c[0]} ${c[1]}`
  ),
  getRoadSides = CS(
    [getRoadPoints],
    ({ a, b, c, d }) => "M" + a + "L" + b + "M" + c + "L" + d
  ),
  getHinge = CS(
    [getRoadPoints],
    ({ a, b, c, d, center }) => "M" + b + "L" + center + "L" + c
  ),
  getTotal = CS(
    [getΔ2Rad, getRoadPointsRaw],
    (Δ2, { r, side }) => (2 * side) / Math.cos(Δ2) + r * Δ2 * 2
  ),
  getTangents = CS(
    getRoadPoints,
    ({ pvi, a, b, c, d }) => "M" + b + "L" + pvi + "L" + c
  ),
  getCar = CS(
    [get("x"), getΔ2Rad, getRoadPointsRaw, getXScale, getYScale],
    (x, Δ2, rp, xScale, yScale) => {
      const sideLength = rp.side / Math.cos(Δ2);
      if (x < sideLength)
        return {
          loc: [xScale(x * Math.cos(Δ2)), yScale(x * Math.sin(Δ2))],
          rotate: (-Δ2 / Math.PI) * 180
        };
      const arcLength = rp.r * Δ2 * 2;
      if (x - sideLength < arcLength) {
        const δ = (x - sideLength) / rp.r - Δ2;
        return {
          loc: [
            xScale(rp.center[0] + rp.r * Math.sin(δ)),
            yScale(rp.center[1] + rp.r * Math.cos(δ))
          ],
          rotate: (δ / Math.PI) * 180
        };
      }
      let total = 2 * sideLength + arcLength;
      x = total - x;
      return {
        loc: [xScale(params.W - x * Math.cos(Δ2)), yScale(x * Math.sin(Δ2))],
        rotate: (Δ2 / Math.PI) * 180
      };
    }
  );

export const AppContext = React.createContext<{
  state: State;
  dispatch?: Dispatch<Action>;
}>({ state: initialState, dispatch: null });
