import type { Error } from "../types";
import { DISMISS_ERROR, THROW_ERROR, FetchStatus } from "../actions";

export type ErrorsState = Array<Error>;

export default function errorsReducer(state: ErrorsState = [], action) {
  switch (action.type) {
    case DISMISS_ERROR:
      return state.filter(it => it.uuid !== action.error.uuid);
    case THROW_ERROR:
      return [
        ...state.filter(it => it.uuid !== action.error.uuid),
        action.error
      ];
    default:
      if (action.fetchStatus === FetchStatus.FAILURE) {
        return [
          ...state.filter(it => it.uuid !== action.error.uuid),
          action.error
        ];
      }
      return state;
  }
}
