// @flow
import React, { Component } from "react";
import ReactDataGrid from "react-data-grid";
import { ButtonToolbar, Button, Alert } from "react-bootstrap";
import PropTypes from "prop-types";

import type { FileContentState } from "../reducers/filesContentReducer";
import type { ExcelFile } from "../types";
import { debounce } from "lodash";

import ChangedFlagFormatter from "../formatters/ChangedFlagFormatter"
import ConfirmButton from "../components/ConfirmButton";
import * as Formatters from "../formatters";
import * as Editors from "../editors";

// 81: header
// 54: button bar
const PADDING = 81 + 54;

function overrideConfig(col, config) {
  const result = Object.assign({}, col, config.style);
  const { editor, formatter } = config;
  if (editor !== undefined) {
    const editorComponent = Editors[editor.component];
    if (editorComponent === undefined) {
      throw new Error("Editor 不存在: " + editor.component);
    }
    result.editor = React.createElement(editorComponent, editor.props || {});
  }
  if (formatter !== undefined) {
    const formatterComponent = Formatters[formatter.component];
    if (formatterComponent === undefined) {
      throw new Error("Formatter 不存在: " + formatter.component);
    }
    result.formatter = <ChangedFlagFormatter
      formatter={formatterComponent}
      formatterProps={formatter.props || {}}
    />
  } else {
    result.formatter = <ChangedFlagFormatter />;
  }

  return result;
}

class FileEditor extends Component {
  state = {
    height: 500,
    selectedIndexes: ([]: number[])
  };

  getChildContext() {
    if (!this.props.fileContent.content) {
      return { changes: {} }
    }
    const index = {};
    for (let i = 0; i < this.props.fileContent.content.rows.length; ++i) {
      index[this.props.fileContent.content.rows[i].row] = i;
    }

    const changes = {};
    for (const change of this.props.fileContent.changes) {
      changes[index[change.row]] = change.columns;
    }
    return { changes };
  }

  onRowsSelected = (rows: any[]) => {
    this.setState({
      selectedIndexes: this.state.selectedIndexes.concat(
        rows.map(r => r.rowIdx)
      )
    });
  };

  onRowsDeselected = (rows: any[]) => {
    let rowIndexes = rows.map(r => r.rowIdx);
    this.setState({
      selectedIndexes: this.state.selectedIndexes.filter(
        i => rowIndexes.indexOf(i) === -1
      )
    });
  };

  clearSelectedRows = () => {
    const { fileContent, clearRows } = this.props;
    clearRows(
      this.state.selectedIndexes.map(function(i) {
        return fileContent.content.rows[i];
      })
    );
    this.setState({ selectedIndexes: [] });
  };

  updateDimensions = () => {
    const w = window,
      d = document,
      e = d.documentElement,
      g = d.getElementsByTagName("body")[0],
      y = w.innerHeight || (e && e.clientHeight) || (g && g.clientHeight);
    const height = Math.max(y - PADDING, 500);
    this.setState({ height });
  };

  debounceUpdateDimensions = debounce(this.updateDimensions, 500);

  componentWillMount() {
    this.updateDimensions();
  }

  componentDidMount() {
    window.addEventListener &&
      window.addEventListener("resize", this.debounceUpdateDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener &&
      window.removeEventListener("resize", this.debounceUpdateDimensions);
  }

  columns() {
    const { fileContent, config } = (this.props: {
      fileContent: FileContentState,
      config: any
    });
    const file: ExcelFile = fileContent.content;
    if (file == null) {
      return [];
    }

    const tuples: Array<[string, number]> = (Object.entries(
      file.columnsPosition || {}
    ): any);
    return tuples
      .map(([k, v]) =>
        overrideConfig(
          {
            colIdx: v,
            key: k,
            width: 200,
            editable: true,
            locked: false,
            resizable: true,
            name: file.columnsTitle[k] || k
          },
          config.columns[k] || {}
        )
      )
      .filter(e => !e.hidden)
      .sort((a, b) => {
        if (a.locked && !b.locked) {
          return -1;
        }
        if (b.locked && !a.locked) {
          return 1;
        }
        return a.colIdx - b.colIdx;
      });
  }

  reorderRows = (e: any) => {
    const sourceIndex = e.rowSource.idx;
    const targetIndex = e.rowTarget.idx;

    this.props.moveRows(
      sourceIndex in this.state.selectedIndexes
        ? this.state.selectedIndexes
        : [sourceIndex],
      targetIndex
    );
  };

  render() {
    const { fileContent } = (this.props: { fileContent: FileContentState });

    const file = fileContent.content;
    if (file == null) {
      return null;
    }

    try {
      return (
        <div>
          <ButtonToolbar>
            <Button
              disabled={this.state.selectedIndexes.length === 0}
              onClick={this.clearSelectedRows}
            >
              清空选中行
            </Button>
            <Button
              onClick={() => this.props.addRow(this.state.selectedIndexes[0])}
            >
              {this.state.selectedIndexes.length === 0
                ? "末尾添加新行"
                : `在第${this.state.selectedIndexes[0] + 1}行插入新行`}
            </Button>
            <Button onClick={this.props.openExcel}>打开 Excel</Button>
            <Button onClick={this.props.invalidateFile}>刷新数据</Button>
            <Button
              disabled={fileContent.changes.length === 0}
              bsStyle="primary"
              onClick={this.props.commitFileChanges}
            >
              保存修改
            </Button>
            <ConfirmButton
              disabled={fileContent.changes.length === 0}
              bsStyle="danger"
              confirm="放弃无法恢复，确认放弃"
              onClick={this.props.rollbackFile}
            >
              放弃修改
            </ConfirmButton>
          </ButtonToolbar>
          <br />
          <ReactDataGrid
            enableCellSelect={true}
            columns={this.columns()}
            rowGetter={i => file.rows[i].columns}
            rowsCount={file.rows.length}
            minHeight={this.state.height}
            onGridRowsUpdated={this.props.onGridRowsUpdated}
            rowSelection={{
              showCheckbox: true,
              enableShiftSelect: true,
              onRowsSelected: this.onRowsSelected,
              onRowsDeselected: this.onRowsDeselected,
              selectBy: {
                indexes: this.state.selectedIndexes
              }
            }}
          />
        </div>
      );
    } catch (error) {
      return (
        <Alert bsStyle="danger">
          {error.message}
        </Alert>
      );
    }
  }
}

FileEditor.childContextTypes = {
  changes: PropTypes.any
};

export default FileEditor;
