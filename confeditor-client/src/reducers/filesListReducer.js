// @type
import {
  FETCH_LIST,
  INVALIDATE_LIST,
  SET_FILTER,
  SHOW_CONFIGURED,
  FetchStatus
} from "../actions";

export type FilesListState = {
  isFetching: boolean,
  didInvalidate: boolean,
  updatedAt: number,
  filter: string,
  showConfiguredEnabled: boolean,
  names: Array<string>
};

export default function filesListReducer(
  state: FilesListState = {
    isFetching: false,
    didInvalidate: true,
    updatedAt: 0,
    filter: "",
    showConfiguredEnabled: true,
    names: []
  },
  action: any
): FilesListState {
  switch (action.type) {
    case FETCH_LIST:
      switch (action.fetchStatus) {
        case FetchStatus.REQUEST:
          return { ...state, isFetching: true, didInvalidate: false };
        case FetchStatus.SUCCESS:
          return {
            ...state,
            isFetching: false,
            didInvalidate: false,
            updatedAt: action.recievedAt,
            names: action.response
          };
        case FetchStatus.FAILURE:
          return { ...state, isFetching: false };
        default:
          return state;
      }
    case INVALIDATE_LIST:
      return { ...state, didInvalidate: true };
    case SET_FILTER:
      return { ...state, filter: action.filter };
    case SHOW_CONFIGURED:
      return { ...state, showConfiguredEnabled: action.enabled };
    default:
      return state;
  }
}
