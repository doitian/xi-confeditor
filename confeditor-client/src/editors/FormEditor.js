import React, { Component } from "react";
import { Modal, Form, Button } from "react-bootstrap";

import createControl from "../controls/createControl";
import getValue from "../controls/getValue";

class FormEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: true,
      unsavedValue: props.value,
      value: props.value
    };
  }

  getInputNode() {
    return this.inputNode;
  }

  getValue() {
    const { column: { key } } = this.props;
    const updated = {};
    updated[key] = this.state.value;
    return updated;
  }

  hasResults() {
    return this.state.show;
  }

  save = () => {
    event.stopPropagation();
    event.preventDefault();

    this.setState(
      ({ unsavedValue }) => ({ show: false, value: unsavedValue }),
      this.props.onCommit
    );
  };

  close = () => {
    event.stopPropagation();
    event.preventDefault();

    this.setState({ show: false }, this.props.onBlur);
  };

  handleValueChange = valueOrEvent =>
    this.setState({
      unsavedValue: getValue(valueOrEvent)
    });

  render() {
    return (
      <div>
        <input
          ref={el => (this.inputNode = el)}
          type="text"
          value={this.state.value}
          disabled={true}
        />
        <Modal bsSize="large" show={this.state.show} onHide={this.props.onCommitCancel}>
          <Modal.Header closeButton>
            <Modal.Title>编辑 {this.props.column.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={this.save}>
              {createControl(this.props.control, {
                autoFocus: true,
                value: this.state.unsavedValue,
                onChange: this.handleValueChange
              })}
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button bsStyle="primary" onClick={this.save}>
              保存
            </Button>
            <Button onClick={this.close}>
              取消
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default FormEditor;
