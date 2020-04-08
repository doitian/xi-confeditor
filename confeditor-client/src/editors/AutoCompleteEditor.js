import React, { Component } from "react";
import ReactDOM from "react-dom";
import VirtualizedSelect from "react-virtualized-select";

import "react-select/dist/react-select.css";
import "react-virtualized/styles.css";
import "react-virtualized-select/styles.css";

const EMPTY_OPTION = { value: "" };

class AutoCompleteEditor extends Component {
  disableContainerStyles = true;

  constructor(props) {
    super(props);
    this.state = {};
  }

  getInputNode() {
    return ReactDOM.findDOMNode(this).getElementsByTagName("input")[0];
  }

  getValue() {
    console.log('getValue');
    const { column: { key }, unpack, pack, saveAs } = this.props;
    const { selected } = this.state;
    if (!selected) {
      return;
    }

    const values = selected.map(({ value }) => value);
    let updated = {};
    updated[key] = pack ? pack(values) : values[0] || "";

    if (saveAs) {
      const savedAs = saveAs(unpack ? selected : selected[0]);
      if (savedAs) {
        Object.entries(savedAs).forEach(([k, v]) => {
          if (v !== undefined) {
            updated[k] = v;
          }
        });
      }
    }

    return updated;
  }

  isSelectOpen() {
    return true;
  }

  hasResults() {
    return true;
  }

  handleSelectChange = option => {
    console.log('handleSelectChange');
    clearTimeout(this.closeTimer);

    const multi = !!this.props.unpack;
    const selected = multi ? option || [] : [option || EMPTY_OPTION];

    const callback = !multi ? this.props.onCommit : null;
    this.setState({ selected }, callback);
  };

  handleClose = () => {
    this.closeTimer = setTimeout(this.props.onCommitCancel, 0);
  };

  selected() {
    const { selected } = this.state;
    if (selected) {
      return selected;
    }

    const { value, unpack } = this.props;
    const values = unpack ? unpack(value) : [value];
    return values.map(value => ({ value }));
  }

  options() {
    const { rowData, preFilterOptions, options } = this.props;
    if (preFilterOptions) {
      return preFilterOptions(rowData, options);
    }

    return options;
  }

  render() {
    const { unpack } = this.props;
    const multi = !!unpack;
    const values = this.selected().map(({ value }) => value);

    const selectProps = Object.assign(
      {
        placeholder: "选择...",
        searchPromptText: "输入开始搜索",
        noResultsText: "找不到匹配的选项"
      },
      this.props,
      {
        value: multi ? values : values[0],
        multi: multi,
        onChange: this.handleSelectChange,
        onBlur: (e) => e.stopPropagation(),
        openOnFocus: true,
        options: this.options(),
        onClose: this.handleClose
      }
    );

    return <VirtualizedSelect {...selectProps} />;
  }
}

export default AutoCompleteEditor;
