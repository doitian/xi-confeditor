import { OPEN_FILE, CLOSE_FILE } from "../actions";

export type OpenFilesState = Array<string>;

export default function openFilesReducer(state: OpenFilesState = [], action) {
  switch (action.type) {
    case OPEN_FILE:
      if (state.indexOf(action.name) === -1) {
        return [...state, action.name];
      }
      break;
    case CLOSE_FILE:
      return state.filter(e => e !== action.name);
    default:
    // pass
  }

  return state;
}
