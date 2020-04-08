import React, { Component } from "react";
import { connect } from "react-redux";
import FileEditor from "../components/FileEditor";
import { initialFileContentState } from "../reducers/filesContentReducer";
import {
  boundFetchFileIfNeeded,
  updateFile,
  rollbackFile,
  commitFileChanges,
  clearRows,
  addRow,
  moveRows,
  openExcel,
  invalidateFile
} from "../actions";
import deferComponentRender from "../components/deferComponentRender";
import { editorConfigOf } from "../editorConfig";

const DeferedFileEditor = deferComponentRender(FileEditor);

class FileEditorContainer extends Component {
  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps({ dispatch, match, fileContent, dependencies }) {
    boundFetchFileIfNeeded(dispatch, match.params.name, fileContent);
    dependencies.forEach(function({ name, fileContent }) {
      boundFetchFileIfNeeded(dispatch, name, fileContent);
    });
  }

  onGridRowsUpdated = ({ fromRow, toRow, updated }) => {
    if (updated === null || updated === undefined) {
      return;
    }

    const { dispatch, match, fileContent, config } = this.props;
    const rows = [];
    for (let i = fromRow; i <= toRow; ++i) {
      const row = fileContent.content.rows[i];
      let rowUpdated = updated;
      if (config.onUpdated) {
        rowUpdated = { ...updated };
        config.onUpdated(row.columns, rowUpdated);
      }
      rows.push({
        ...row,
        columns: rowUpdated
      });
    }
    dispatch(updateFile(match.params.name, rows));
  };

  addRow = (atIndex = null) => {
    const { dispatch, match } = this.props;
    dispatch(addRow(match.params.name, atIndex));
  };

  moveRows = (sourceIndices, targetIndex) => {
    const { dispatch, match } = this.props;
    dispatch(moveRows(match.params.name, sourceIndices, targetIndex));
  };

  clearRows = rows => {
    const { dispatch, match } = this.props;
    dispatch(clearRows(match.params.name, rows));
  };

  rollbackFile = () => {
    const { dispatch, match } = this.props;
    dispatch(rollbackFile(match.params.name));
  };

  commitFileChanges = () => {
    const { dispatch, match, fileContent } = this.props;
    dispatch(commitFileChanges(match.params.name, fileContent.changes, false));
  };

  openExcel = () => {
    const { dispatch, match } = this.props;
    dispatch(openExcel(match.params.name));
  };

  invalidateFile = () => {
    const { dispatch, match, dependencies } = this.props;
    dispatch(invalidateFile(match.params.name));
    dependencies.forEach(function({ name }) {
      dispatch(invalidateFile(name));
    });
  };

  shouldDefer(props, nextProps) {
    return props.name !== nextProps.name;
  }

  render() {
    const {
      onGridRowsUpdated,
      addRow,
      moveRows,
      clearRows,
      openExcel,
      invalidateFile,
      rollbackFile,
      commitFileChanges,
      props: { fileContent, config, match }
    } = this;
    const name = match.params.name;
    const childProps = {
      onGridRowsUpdated,
      addRow,
      moveRows,
      clearRows,
      openExcel,
      invalidateFile,
      rollbackFile,
      commitFileChanges,
      fileContent,
      config,
      name
    };
    return <DeferedFileEditor shouldDefer={this.shouldDefer} {...childProps} />;
  }
}

function collectDependsOnInProps(collected, props) {
  if (props.belongsTo) {
    collected[props.belongsTo] = true;
  }
}

function collectDependsOn(config) {
  const collected = {};
  Object.values(config.columns).forEach(function(col) {
    if (col && col.editor && col.editor.props) {
      collectDependsOnInProps(collected, col.editor.props);
    }
    if (col && col.formatter && col.formatter.props) {
      collectDependsOnInProps(collected, col.formatter.props);
    }
  });

  const names = Object.keys(collected);
  if (names.length > 0) {
    if (config.dependsOn) {
      return names.concat(config.dependsOn);
    }
    return names;
  }

  return config.dependsOn || [];
}

const mapStateToProps = (state, { match }) => {
  const fileContent =
    state.filesContent[match.params.name] || initialFileContentState();
  const config = editorConfigOf(match.params.name);
  const dependencies = collectDependsOn(config).map(name => ({
    name,
    fileContent: state.filesContent[name]
  }));

  return {
    fileContent,
    config,
    dependencies
  };
};

const Container = connect(mapStateToProps)(FileEditorContainer);

export default Container;
