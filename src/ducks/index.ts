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
  x: 20,
  v: 18,
  v0: 18,
  time: 0,
  R: 40,
  Δ: 30
};
type Mapper = (v: NN) => NN;

export enum ActionTypes {
  TICK = "TICK",
  SET_V0 = "SET_V0",
  SET_R = "SET_R",
  SET_PLAY = "SET_PLAY",
  RESET = "RESET",
  RESTART = "RESTART",
  SET_Δ = "SET_Δ"
}

export type State = typeof initialState;

type Action =
  | {
      type: ActionTypes.TICK;
      payload: NN;
    }
  | { type: ActionTypes.SET_V0; payload: NN }
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

export const getΔRad = CS<State, NN, NN>([get("Δ")], Δ => (Δ / 180) * Math.PI);

export const getChord = CS<State, NN, NN, NN>(
    [get("R"), getΔRad],
    (R, Δ) => 2 * R * Math.sin(Δ / 2)
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
  getYScale = CS<
    State,
    { width: number; height: number },
    number,
    number,
    ScaleLinear<number, number>
  >([(_, props) => props.height, (_, props) => props.width], (height, width) =>
    scaleLinear()
      .domain([0, (params.W * height) / width || 5])
      .range([height, 0])
  ),
  getRoadPoints = CS(
    [getΔRad, get("R"), getXScale, getYScale],
    (Δ, R, xScale, yScale) => {
      let chord = 2 * R * Math.sin(Δ / 2);
      let side = (params.W - chord) / 2;
      let yKink = yScale(params.y0 + Math.tan(Δ / 2) * side);
      return {
        a: [0, yScale(params.y0)],
        b: [xScale(side), yKink],
        c: [xScale(side + chord), yKink],
        d: [xScale(params.W), yScale(params.y0)],
        r: xScale(R),
        center: [xScale(side + chord / 2), yKink + xScale(Math.cos(Δ / 2) * R)]
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
  );
// getCircleParams = CS(getRoadPoints,({center:[cx,cy],r}))

export const AppContext = React.createContext<{
  state: State;
  dispatch?: Dispatch<Action>;
}>({ state: initialState, dispatch: null });
