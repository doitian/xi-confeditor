import React from "react";
import { Alert } from "react-bootstrap";

import * as Controls from "../controls";

export default function createControl({ component, props }, defaultProps = {}) {
  const control = typeof component === "string"
    ? Controls[component]
    : component;
  if (control === undefined) {
    return <Alert bsStyle="danger">控件 {component} 不存在</Alert>;
  }

  const controlProps = Object.assign({ createControl }, defaultProps, props);
  return React.createElement(control, controlProps);
}
