// @flow
import type { Action, ExcelFile, ExcelRow } from "../types";
import { isEmpty } from "lodash";
import {
  FETCH_FILE,
  INVALIDATE_FILE,
  FETCH_POST_FILE,
  ADD_ROW,
  MOVE_ROWS,
  UPDATE_FILE,
  ROLLBACK_FILE,
  FetchStatus
} from "../actions";
import { editorConfigOf } from "../editorConfig";

export type FileContentState = {
  isFetching: boolean,
  isUpdating: boolean,
  didInvalidate: boolean,
  updatedAt: number,
  autoComplete: { [string]: { value: string, label: string } },
  originalContent: ?ExcelFile,
  changes: ExcelRow[],
  content: ?ExcelFile
};
export type FilesContentState = {
  [string]: FileContentState
};

export type AutoCompleteItem = {
  value: string,
  label: string
};

export const initialFileContentState = () => ({
  isFetching: false,
  didInvalidate: true,
  updatedAt: 0,
  autoComplete: {},
  changes: [],
  originalContent: null,
  content: null
});

function byRow(a: ExcelRow, b: ExcelRow) {
  return a.row - b.row;
}

export function mergeRows(to: ExcelRow[], from: ExcelRow[]): ExcelRow[] {
  const fromHash = {};
  for (const r of from) {
    fromHash[r.row] = r;
  }

  const merged = to.map(function(toRow) {
    const id = toRow.row;
    const fromRow = fromHash[id];
    if (fromRow === null || fromRow === undefined) {
      return toRow;
    }

    delete fromHash[id];
    return {
      ...toRow,
      columns: {
        ...toRow.columns,
        ...fromRow.columns
      }
    };
  });

  return merged.concat(Object.values(fromHash)).sort(byRow);
}

function updateFile(file: ExcelFile, rows: ExcelRow[]): ExcelFile {
  const newRows = mergeRows(file.rows, rows);
  let nextRowNum = file.nextRowNum;
  if (newRows.length > 0) {
    const maxRowNum = newRows[newRows.length - 1].row;
    if (maxRowNum >= nextRowNum) {
      nextRowNum = maxRowNum + 1;
    }
  }
  return {
    ...file,
    nextRowNum,
    rows: newRows
  };
}

function moveRows(
  state: FileContentState,
  sourceIndices: number[],
  targetIndex: number
): FileContentState {
  if (targetIndex === null || targetIndex === undefined) {
    return state;
  }
  if (!state.content) {
    return state;
  }

  const mapping = [];
  for (let i = 0; i < state.content.rows.length; ++i) {
    mapping.push(i);
  }
  for (let i = sourceIndices.length - 1; i >= 0; --i) {
    mapping.splice(sourceIndices[i], 1);
  }

  let splicePos =
    targetIndex + 1 - sourceIndices.filter(e => e <= targetIndex).length;
  mapping.splice(splicePos, 0, ...sourceIndices);

  const rows = state.content.rows;
  const changes = [];
  for (let i = 0; i < mapping.length; ++i) {
    if (mapping[i] !== i) {
      const columns = rows[mapping[i]].columns;
      if (isEmpty(columns)) {
        for (const k in rows[i].columns) {
          columns[k] = "";
        }
      }
      changes.push({
        row: rows[i].row,
        columns: rows[mapping[i]].columns
      });
    }
  }

  return {
    ...state,
    changes: mergeRows(state.changes, changes),
    content: updateFile(state.content, changes)
  };
}

function defaultToAutoCompleteOption(row) {
  return { value: row.id, label: row.name || row.title || row.id };
}

function buildAutoCompleteOptions(file: ExcelFile) {
  const result = {};
  const config = editorConfigOf(file.name);
  const toOption = config.toAutoCompleteOption || defaultToAutoCompleteOption;
  file.rows.forEach(function(r) {
    const option = toOption(r.columns);
    result[option.value] = option;
  });

  return result;
}

export default function filesContentReducer(
  state: FilesContentState = {},
  action: Action
): FilesContentState {
  let file = null;

  switch (action.type) {
    case FETCH_FILE:
      file = state[action.name] || initialFileContentState();
      switch (action.fetchStatus) {
        case FetchStatus.REQUEST:
          return {
            ...state,
            [action.name]: {
              ...file,
              isFetching: true,
              didInvalidate: false
            }
          };
        case FetchStatus.SUCCESS:
          return {
            ...state,
            [action.name]: {
              ...file,
              isFetching: false,
              didInvalidate: false,
              updatedAt: action.recievedAt,
              content: updateFile(action.response, file.changes),
              originalContent: action.response,
              autoComplete: buildAutoCompleteOptions(action.response)
            }
          };
        case FetchStatus.FAILURE:
          return {
            ...state,
            [action.name]: {
              ...file,
              isFetching: false
            }
          };
        default:
          return state;
      }
    case INVALIDATE_FILE:
      file = state[action.name] || initialFileContentState();
      return {
        ...state,
        [action.name]: {
          ...file,
          didInvalidate: true
        }
      };
    case UPDATE_FILE:
      file = state[action.name] || initialFileContentState();
      return {
        ...state,
        [action.name]: {
          ...file,
          changes: mergeRows(file.changes, action.rows),
          content: updateFile(file.content, action.rows)
        }
      };
    case ROLLBACK_FILE:
      file = state[action.name] || initialFileContentState();
      return {
        ...state,
        [action.name]: {
          ...file,
          changes: [],
          content: file.originalContent
        }
      };
    case ADD_ROW:
      file = state[action.name] || initialFileContentState();
      let newRow = {
        row: file.content.nextRowNum,
        columns: {}
      };
      return {
        ...state,
        [action.name]: moveRows(
          {
            ...file,
            changes: [...file.changes, newRow],
            content: {
              ...file.content,
              nextRowNum: file.content.nextRowNum + 1,
              rows: [...file.content.rows, newRow]
            }
          },
          [file.content.rows.length],
          action.atIndex - 1
        )
      };
    case MOVE_ROWS:
      file = state[action.name] || initialFileContentState();
      return {
        ...state,
        [action.name]: moveRows(file, action.sourceIndices, action.targetIndex)
      };
    case FETCH_POST_FILE:
      file = {
        ...(state[action.name] || initialFileContentState())
      };
      switch (action.fetchStatus) {
        case FetchStatus.REQUEST:
          if (action.rows != null) {
            file.originalContent = updateFile(
              file.originalContent,
              action.rows
            );
            file.content = file.originalContent;
            file.changes = [];
            file.autoComplete = buildAutoCompleteOptions(file.originalContent);
          }
          break;
        case FetchStatus.SUCCESS:
          file.originalContent = updateFile(
            file.originalContent,
            action.response
          );
          file.content = updateFile(file.originalContent, file.changes);
          file.autoComplete = buildAutoCompleteOptions(file.originalContent);
          break;
        default:
        // pass
      }
      file.isUpdating = action.fetchStatus === FetchStatus.REQUEST;
      return { ...state, [action.name]: file };
    default:
      return state;
  }
}
