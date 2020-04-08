import React from "react";
import { Form } from "react-bootstrap";
import getValue from "../controls/getValue";

export default function ObjectControl({
  createControl,
  label,
  pack,
  unpack,
  value,
  autoFocus,
  onChange,
  itemControl,
  inline,
  horizontal
}) {
  const obj = unpack(value);

  let children = itemControl.map(({ field, control }, i) => {
    return createControl(control, {
      horizontal: horizontal,
      key: i,
      autoFocus: autoFocus && i === 0,
      value: obj[field] || "",
      onChange: v => {
        obj[field] = getValue(v);
        onChange(pack(obj));
      }
    });
  });

  if (inline) {
    const childrenWithSpaces = new Array(children.length * 2);
    children.forEach((v, i) => {
      childrenWithSpaces[i * 2] = v;
      childrenWithSpaces[i * 2 + 1] = " ";
    });
    children = childrenWithSpaces;
  }

  return (
    <Form componentClass="fieldset" inline={inline} horizontal={horizontal}>
      {label ? <legend>{label}</legend> : null}
      {children}
    </Form>
  );
}
