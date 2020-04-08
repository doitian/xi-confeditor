import React, { Component } from "react";
import ReactDOM from "react-dom";
import { FormControl, InputGroup } from "react-bootstrap";

export default class TextEditor extends Component {
  render() {
    const { value, before, after, unpack } = this.props;

    const control = (
      <FormControl
        ref={el => (this.control = el)}
        type="text"
        defaultValue={unpack ? unpack(value) : value}
      />
    );

    if (before || after) {
      return (
        <InputGroup>
          {before ? <InputGroup.Addon>{before}</InputGroup.Addon> : null}
          {control}
          {after ? <InputGroup.Addon>{after}</InputGroup.Addon> : null}
        </InputGroup>
      );
    }

    return control;
  }

  getValue() {
    const updated = {};
    let value = this.getInputNode().value;
    if (this.props.pack) {
      value = this.props.pack(this.props.value, value);
    }

    updated[this.props.column.key] = value;
    return updated;
  }

  getInputNode() {
    return ReactDOM.findDOMNode(this.control);
  }
}
