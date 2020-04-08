// @flow
import { combineReducers } from "redux";

import { loadingBarReducer as loadingBar } from "react-redux-loading-bar";
import filesList from "./filesListReducer";
import filesContent from "./filesContentReducer";
import errors from "./errorsReducer";
import openFiles from "./openFilesReducer";

function updatedAt() {
  const now = new Date();
  return now.getTime();
}

const rootReducer = combineReducers({
  filesList,
  filesContent,
  errors,
  loadingBar,
  openFiles,
  updatedAt
});

export default rootReducer;
