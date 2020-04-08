import React from "react";
import { Table, Button, Glyphicon, Form } from "react-bootstrap";
import getValue from "../controls/getValue";

export default function ListControl({
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
  const list = unpack(value);

  return (
    <Table bordered condensed>
      {label
        ? <thead>
            <tr>
              <th colSpan="2">{label}</th>
            </tr>
          </thead>
        : null}
      <tbody>
        {list.map((itemValue, i) => (
          <tr key={i}>
            <td>
              <Form
                componentClass="fieldset"
                inline={inline}
                horizontal={horizontal}
              >
                {createControl(itemControl, {
                  horizontal: horizontal,
                  autoFocus: autoFocus && i === 0,
                  value: itemValue,
                  onChange: v => {
                    list[i] = getValue(v);
                    onChange(pack(list));
                  }
                })}
              </Form>
            </td>
            <td width={20}>
              <Button
                bsStyle="danger"
                bsSize="small"
                onClick={() => {
                  list.splice(i, 1);
                  onChange(pack(list));
                }}
              >
                <Glyphicon glyph="trash" />
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td>&nbsp;</td>
          <td width={20}>
            <Button
              bsStyle="primary"
              bsSize="small"
              onClick={() => {
                list.push("");
                onChange(pack(list));
              }}
            >
              <Glyphicon glyph="plus" />
            </Button>
          </td>
        </tr>
      </tfoot>
    </Table>
  );
}
