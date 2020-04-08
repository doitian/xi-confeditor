import React, { Component } from "react";
import { Nav, NavItem } from "react-bootstrap";
import Helmet from "react-helmet";
import CloseButton from "react-bootstrap/lib/CloseButton";
import { LinkContainer } from "react-router-bootstrap";

function tabOfFile(name) {
  return { name, href: decodeURI(`/e/${encodeURIComponent(name)}`) };
}

const TITLE = "配表编辑器"

export default class Tabs extends Component {
  static defaultProps = {
    names: []
  };

  tab = ({ name, href, exact }, i) => {
    return (
      <LinkContainer key={href} to={href} exact={exact}>
        <NavItem>
          {i > 0
            ? <CloseButton
                label="关闭标签"
                onClick={e => {
                  e.stopPropagation();
                  e.preventDefault();
                  this.handleClose(name);
                }}
              />
            : null}
          <span style={i > 0 ? { marginTop: "-5px", paddingRight: "5px" } : {}}>
            {name}
          </span>
        </NavItem>
      </LinkContainer>
    );
  };

  handleClose(name) {
    const { match, history, closeFile } = this.props;
    if (!name) {
      return;
    }
    if (name === match.params.name) {
      history.push("/");
    }
    closeFile(name);
  }

  render() {
    const { match, names } = this.props;

    const tabs = [
      { exact: true, name: "Home", href: "/" },
      ...names.map(tabOfFile)
    ];

    const { name } = match.params;
    let idx = 0;
    if (name) {
      idx = names.indexOf(name) + 1;
      if (idx === 0) {
        tabs.push(tabOfFile(name));
        idx = tabs.length - 1;
      }
    }

    return (
      <div>
        <Helmet>
          <title>{ name ? `${name} • ${TITLE}` : TITLE }</title>
        </Helmet>
        <Nav bsStyle="tabs">
          {tabs.map(this.tab)}
        </Nav>
      </div>
    );
  }
}
