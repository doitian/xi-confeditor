import React, { Component } from "react";
import { debounce } from "lodash";
import {
  ListGroup,
  ListGroupItem,
  InputGroup,
  FormControl,
  Button,
  Checkbox,
  Glyphicon,
  Row,
  Col
} from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { isEditorConfigured } from "../editorConfig";

class FilesList extends Component {
  debounceSetFilter = debounce(filter => {
    this.props.setFilter(filter);
  });

  handleChangeFilter = e => this.debounceSetFilter(e.target.value);

  clearFilter = () => {
    if (this.input) {
      this.input.value = "";
    }
    this.props.setFilter("");
  };

  render() {
    const { openFile, names } = this.props;
    const filter = this.props.filter.trim();
    let filteredNames = filter === ""
      ? names
      : names.filter(name => name.indexOf(filter) !== -1);
    if (this.props.showConfiguredEnabled) {
      filteredNames = filteredNames.filter(isEditorConfigured);
    }

    const children = filteredNames.map(name => (
      <LinkContainer
        key={name}
        to={decodeURI(`/e/${encodeURIComponent(name)}`)}
        onClick={() => openFile(name)}
      >
        <ListGroupItem>
          {name}{" "}
          {(!this.props.showConfiguredEnabled && isEditorConfigured(name))
            ? <Glyphicon glyph="star" />
            : null}
        </ListGroupItem>
      </LinkContainer>
    ));

    return (
      <div>
        <Row>
          <Col sm={7}>
            <InputGroup>
              <InputGroup.Button>
                <Button
                  type="reset"
                  disabled={this.props.filter.trim() === ""}
                  onClick={this.clearFilter}
                >
                  清空
                </Button>
              </InputGroup.Button>
              <FormControl
                defaultValue={this.props.filter}
                inputRef={input => (this.input = input)}
                type="text"
                placeholder="过滤"
                onChange={this.handleChangeFilter}
              />
            </InputGroup>
          </Col>
          <Col sm={3}>
            <Checkbox
              onChange={() =>
                this.props.showConfigured(!this.props.showConfiguredEnabled)}
              checked={this.props.showConfiguredEnabled}
            >
              只显示配置过的
            </Checkbox>
          </Col>
          <Col sm={2}>
            <Button onClick={this.props.invalidateList}>刷新列表</Button>
          </Col>
        </Row>
        <br />

        <ListGroup>{children}</ListGroup>
      </div>
    );
  }
}

export default FilesList;
