import {
  takeLatest,
  takeEvery,
  call,
  put,
  take,
  fork,
  cancel
} from "redux-saga/effects";
import { delay } from "redux-saga";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import { mergeRows } from "../reducers/filesContentReducer";
import * as api from "../api";

import {
  FETCH_LIST,
  FETCH_FILE,
  FETCH_POST_FILE,
  OPEN_EXCEL,
  FetchStatus,
  fetchListSuccess,
  fetchListFailure,
  fetchFileSuccess,
  fetchFileFailure,
  fetchPostFileFailure,
  throwError
} from "../actions";

import webSocketSaga from "./webSocketSaga";

function fetchingPattern(type) {
  return action =>
    action.type === type && action.fetchStatus === FetchStatus.REQUEST;
}

function* fetchList() {
  try {
    yield put(showLoading());
    const data = yield call(api.fetchList);
    yield put(fetchListSuccess(data.names));
  } catch (error) {
    yield put(fetchListFailure(error.message));
  } finally {
    yield put(hideLoading());
  }
}

function* fetchFile(action) {
  try {
    yield put(showLoading());
    const data = yield call(api.fetchFile, action.name);
    yield put(fetchFileSuccess(action.name, data));
  } catch (error) {
    yield put(fetchFileFailure(action.name, error.message));
  } finally {
    yield put(hideLoading());
  }
}

function* aggregateFetchingFile() {
  const pendingOfFile = {};
  while (true) {
    const action = yield take(FETCH_FILE);
    switch (action.fetchStatus) {
      case FetchStatus.REQUEST:
        const pending = pendingOfFile[action.name];
        if (pending !== undefined) {
          yield cancel(pending);
        }

        const task = yield fork(fetchFile, action);
        pendingOfFile[action.name] = task;
        break;
      case FetchStatus.SUCCESS:
        delete pendingOfFile[action.name];
        break;
      default:
      // pass
    }
  }
}

function* fetchPostFile(action) {
  try {
    yield call(delay, 1000);
    yield put(showLoading());
    yield call(api.commitFileChanges, action.name, action.rows);
  } catch (error) {
    // the changes is already aggregated.
    yield put(fetchPostFileFailure(action.name, action.rows, error.message));
  } finally {
    yield put(hideLoading());
  }
}

function* aggregateFileChanges() {
  const pendingOfFile = {};
  while (true) {
    const action = yield take(FETCH_POST_FILE);
    switch (action.fetchStatus) {
      case FetchStatus.REQUEST:
        const pending = pendingOfFile[action.name];
        let rows = action.rows;
        if (pending !== undefined) {
          yield cancel(pending.task);
          if (!action.isRetry) {
            rows = mergeRows(pending.rows, action.rows);
          }
        }

        const task = yield fork(fetchPostFile, { ...action, rows });
        pendingOfFile[action.name] = { task, rows };
        break;
      case FetchStatus.SUCCESS:
        delete pendingOfFile[action.name];
        break;
      default:
      // pass
    }
  }
}

function* openExcel(action) {
  try {
    yield call(api.openExcel, action.name);
  } catch (error) {
    // the changes is already aggregated.
    yield put(throwError(`无法打开 ${action.name}: ${error.message}`));
  }
}

function* rootSaga() {
  yield takeLatest(fetchingPattern(FETCH_LIST), fetchList);
  yield takeEvery(OPEN_EXCEL, openExcel);
  yield fork(aggregateFetchingFile);
  yield fork(aggregateFileChanges);
  yield fork(webSocketSaga);
}

export default rootSaga;
