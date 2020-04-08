import { eventChannel, delay } from "redux-saga";
import { put, call, take, cancel, fork } from "redux-saga/effects";

import { fetchPostFileSuccess, throwError, dismissError } from "../actions";

const WEBSOCKET_CLOSE = "WEBSOCKET_CLOSE";
const WEBSOCKET_MESSAGE = "WEBSOCKET_MESSAGE";

function connect() {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket("ws://" + window.location.host + "/ws");

    const onclose = e => {
      reject(e);
    };
    socket.onopen = () => {
      if (socket.onclose === onclose) {
        socket.onclose = null;
      }
      resolve(socket);
    };
    socket.onclose = onclose;
  });
}

function subscribe(socket) {
  return eventChannel(emit => {
    socket.onmessage = function(event) {
      emit({ type: WEBSOCKET_MESSAGE, data: JSON.parse(event.data) });
    };

    return () => socket.close();
  });
}

function onclose(socket) {
  return eventChannel(emit => {
    socket.onclose = function(e) {
      console.log({ stage: "read", e });
      emit({ type: WEBSOCKET_CLOSE });
    };

    return () => null;
  });
}

function* read(socket) {
  const channel = yield call(subscribe, socket);
  try {
    while (true) {
      const { data: { name, rows } } = yield take(channel);
      yield put(fetchPostFileSuccess(name, rows));
    }
  } finally {
    channel.close();
  }
}

export default function* webSocketSaga() {
  const message = "无法连接服务器，尝试重连中";
  const uuid = "@RECONNECT_ERROR";
  const reconnectError = throwError(message, null, uuid);
  const dismiss = dismissError(reconnectError.error);
  while (true) {
    let socket = null;
    let readTask = null;
    let closeChannel = null;
    try {
      const socket = yield call(connect);
      yield put(dismiss);
      const readTask = yield fork(read, socket);
      const closeChannel = yield call(onclose, socket);
      yield take(closeChannel);
      closeChannel.close();
      yield put(reconnectError);
      yield cancel(readTask);
    } catch (e) {
      yield put(reconnectError);
      if (closeChannel !== null) {
        closeChannel.close();
      }
      if (readTask !== null) {
        yield cancel(readTask);
      }
      if (socket !== null) {
        socket.close();
      }
      yield call(delay, 100);
    }
  }
}
