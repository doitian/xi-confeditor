// @flow
import uuid from "uuid";

import type { ExcelFile, ExcelRow, Action, ActionError } from "./types";
import type { FilesListState } from "./reducers/filesListReducer";
import type { FileContentState } from "./reducers/filesContentReducer";
import { batchActions } from "redux-batch-enhancer";

export const OPEN_FILE = "OPEN_FILE";
export const CLOSE_FILE = "CLOSE_FILE";
export const OPEN_EXCEL = "OPEN_EXCEL";

export const THROW_ERROR = "THROW_ERROR";
export const DISMISS_ERROR = "DISMISS_ERROR";
export const RETRY_ERROR = "RETRY_ERROR";

export const SET_FILTER = "SET_FILTER";
export const SHOW_CONFIGURED = "SHOW_CONFIGURED";
export const FETCH_LIST = "FETCH_LIST";
export const INVALIDATE_LIST = "INVALIDATE_LIST";

export const FETCH_FILE = "FETCH_FILE";
export const INVALIDATE_FILE = "INVALIDATE_FILE";

export const UPDATE_FILE = "UPDATE_FILE";
export const ROLLBACK_FILE = "ROLLBACK_FILE";
export const ADD_ROW = "ADD_ROW";
export const MOVE_ROWS = "MOVE_ROWS";
export const FETCH_POST_FILE = "FETCH_POST_FILE";

export const FetchStatus = {
  REQUEST: "REQUEST",
  SUCCESS: "SUCCESS",
  FAILURE: "FAILURE"
};

function createError(
  message: string,
  action: ?Action,
  overrideUuid: ?string
): ActionError {
  return {
    uuid: overrideUuid || uuid.v4(),
    message,
    action
  };
}

function shouldFetch(state: ?(FilesListState | FileContentState)) {
  if (state !== null && state !== undefined) {
    if (state.isFetching) {
      return false;
    }
    if (state.isUpdating) {
      return false;
    }
    return state.didInvalidate;
  }

  return true;
}

export function openFile(name: string) {
  return { type: OPEN_FILE, name };
}

export function closeFile(name: string) {
  return { type: CLOSE_FILE, name };
}

export function throwError(
  message: string,
  action: ?Action,
  overrideUuid: ?string
) {
  return {
    type: THROW_ERROR,
    error: createError(message, action, overrideUuid)
  };
}

export function dismissError(error: ActionError) {
  return { type: DISMISS_ERROR, error: error };
}
export function retryError(error: ActionError) {
  const dismiss = dismissError(error);
  if (error.action == null) {
    return dismiss;
  }

  return batchActions([dismiss, error.action], RETRY_ERROR);
}

export function fetchList() {
  return { type: FETCH_LIST, fetchStatus: FetchStatus.REQUEST };
}

export function boundFetchListIfNeeded(
  dispatch: Dispatch<any>,
  fileListState: FilesListState
) {
  if (shouldFetch(fileListState)) {
    return dispatch(fetchList());
  }
}

export function fetchListSuccess(names: Array<string>) {
  return {
    type: FETCH_LIST,
    fetchStatus: FetchStatus.SUCCESS,
    recievedAt: Date.now(),
    response: names
  };
}

export function fetchListFailure(message: string) {
  return {
    type: FETCH_LIST,
    fetchStatus: FetchStatus.FAILURE,
    error: createError(message, fetchList())
  };
}

export function invalidateList() {
  return { type: INVALIDATE_LIST };
}

export function fetchFile(name: string) {
  return { type: FETCH_FILE, fetchStatus: FetchStatus.REQUEST, name };
}

export function boundFetchFileIfNeeded(
  dispatch: Dispatch<any>,
  name: string,
  fileContentState: ?FileContentState
) {
  if (shouldFetch(fileContentState)) {
    return dispatch(fetchFile(name));
  }
}

export function fetchFileSuccess(name: string, file: ExcelFile) {
  return {
    type: FETCH_FILE,
    fetchStatus: FetchStatus.SUCCESS,
    recievedAt: Date.now(),
    response: file,
    name
  };
}

export function fetchFileFailure(name: string, message: string) {
  return {
    type: FETCH_FILE,
    fetchStatus: FetchStatus.FAILURE,
    error: createError(message, fetchFile(name)),
    name
  };
}

export function invalidateFile(name: string) {
  return { type: INVALIDATE_FILE, name };
}

export function updateFile(name: string, rows: ExcelRow[]) {
  return {
    type: UPDATE_FILE,
    name,
    rows
  }
}

export function rollbackFile(name: string) {
  return {
    type: ROLLBACK_FILE,
    name
  }
}

export function commitFileChanges(name: string, rows: ExcelRow[], isRetry: boolean = false) {
  return {
    type: FETCH_POST_FILE,
    fetchStatus: FetchStatus.REQUEST,
    name,
    rows,
    isRetry
  };
}

export function addRow(name: string, atIndex: ?number = null) {
  return {
    type: ADD_ROW,
    name,
    atIndex
  };
}

export function moveRows(name: string, sourceIndices: number[], targetIndex: number) {
  return {
    type: MOVE_ROWS,
    name,
    sourceIndices,
    targetIndex
  }
}

export function clearRows(name: string, rows: ExcelRow[]) {
  return {
    type: FETCH_POST_FILE,
    fetchStatus: FetchStatus.REQUEST,
    name,
    rows: rows.map(function(r) {
      const columns = {};
      for (let k of Object.keys(r.columns)) {
        columns[k] = "";
      }
      return { ...r, columns };
    })
  };
}

export function fetchPostFileSuccess(name: string, rows: ExcelRow[]) {
  return {
    type: FETCH_POST_FILE,
    fetchStatus: FetchStatus.SUCCESS,
    recievedAt: Date.now(),
    response: rows,
    name
  };
}

export function fetchPostFileFailure(
  name: string,
  rows: ExcelRow[],
  message: string
) {
  return {
    type: FETCH_POST_FILE,
    fetchStatus: FetchStatus.FAILURE,
    error: createError(
      message,
      commitFileChanges(name, rows, true),
      FETCH_POST_FILE + ":" + name
    ),
    name
  };
}

export function setFilter(filter: string) {
  return {
    type: SET_FILTER,
    filter
  }
}

export function showConfigured(enabled: boolean) {
  return {
    type: SHOW_CONFIGURED,
    enabled
  }
}

export function openExcel(name: string) {
  return {
    type: OPEN_EXCEL,
    name
  }
}
