import React, { Component } from "react";
import { Button, ButtonGroup, Glyphicon } from "react-bootstrap";

export default class ConfirmButton extends Component {
  constructor(props) {
    super(props);
    this.state = { promptShown: false };
  }

  showPrompt = () => this.setState({ promptShown: true });
  hidePrompt = () => this.setState({ promptShown: false });
  confirm = () => {
    this.hidePrompt();
    this.props.onClick();
  }

  render() {
    const childProps = { ...this.props };
    delete childProps.confirm;
    if (!this.state.promptShown) {
      return (
        <Button {...childProps} onClick={this.showPrompt}>
          {this.props.children}
        </Button>
      );
    } else {
      return (
        <ButtonGroup>
          <Button {...childProps} onClick={this.confirm}>{this.props.confirm}</Button>
          <Button {...childProps} onClick={this.hidePrompt}>
            <Glyphicon glyph="remove" />
          </Button>
        </ButtonGroup>
      );
    }
  }
}
