import React from "react";
import { horizontalRatio } from "../controls/horizontalRatio";
import {
  Col,
  FormGroup,
  ControlLabel,
  FormControl,
  InputGroup
} from "react-bootstrap";

export default function TextInputControl({
  label,
  after,
  before,
  horizontal,
  pack,
  unpack,
  onChange,
  value,
  ...rest
}) {
  delete rest["createControl"];

  const onChangeMaybePack = pack
    ? e => onChange(pack(value, e.target.value))
    : onChange;
  const valueMaybeUnpack = unpack ? unpack(value) : value;

  let control = (
    <FormControl
      onChange={onChangeMaybePack}
      value={valueMaybeUnpack}
      {...rest}
      type="text"
    />
  );
  if (before || after) {
    control = (
      <InputGroup>
        {before ? <InputGroup.Addon>{before}</InputGroup.Addon> : null}
        {control}
        {after ? <InputGroup.Addon>{after}</InputGroup.Addon> : null}
      </InputGroup>
    );
  }

  if (!horizontal) {
    return (
      <FormGroup>
        {label ? <ControlLabel>{label}</ControlLabel> : null}
        {label ? " " : null}
        {control}
      </FormGroup>
    );
  }
  const ratio = horizontalRatio(horizontal);
  return (
    <FormGroup>
      <Col componentClass={ControlLabel} sm={ratio[0]}>
        {label}
      </Col>
      <Col sm={ratio[1]}>
        {control}
      </Col>
    </FormGroup>
  );
}
