import React, { Component } from "react";
import VirtualizedSelect from "react-virtualized-select";
import { Col, FormGroup, InputGroup, ControlLabel } from "react-bootstrap";
import horizontalRatio from "../controls/horizontalRatio";

import "react-select/dist/react-select.css";
import "react-virtualized/styles.css";
import "react-virtualized-select/styles.css";

export default class AutoCompleteControl extends Component {
  handleSelectChange = result => {
    const { pack, unpack } = this.props;
    const multi = !!unpack;
    const values = multi
      ? (result || []).map(({ value }) => value)
      : [result && result.value];
    this.props.onChange(pack ? pack(values) : values[0]);
  };

  renderSelect() {
    const { unpack, value } = this.props;

    const selectProps = {
      placeholder: "选择...",
      searchPromptText: "输入开始搜索",
      noResultsText: "找不到匹配的选项",
      options: this.props.options,
      value: unpack ? unpack(value) : value,
      multi: !!unpack,
      onChange: this.handleSelectChange,
      openOnFocus: true,
      autoFocus: this.props.autoFocus
    };

    return <VirtualizedSelect {...selectProps} />;
  }

  render() {
    let control = this.renderSelect();
    const { width, before, after, label, horizontal } = this.props;
    if (before || after) {
      control = (
        <InputGroup>
          {before ? <InputGroup.Addon>{before}</InputGroup.Addon> : null}
          {control}
          {after ? <InputGroup.Addon>{after}</InputGroup.Addon> : null}
        </InputGroup>
      );
    }

    const formGroupProps = width ? { style: { width: width } } : {};

    if (!horizontal) {
      return (
        <FormGroup {...formGroupProps}>
          {label ? <ControlLabel>{label}</ControlLabel> : null}
          {label ? " " : null}
          {control}
        </FormGroup>
      );
    }

    const ratio = horizontalRatio(horizontal);
    return (
      <FormGroup {...formGroupProps}>
        <Col componentClass={ControlLabel} sm={ratio[0]}>
          {label}
        </Col>
        <Col sm={ratio[1]}>
          {control}
        </Col>
      </FormGroup>
    );
  }
}
