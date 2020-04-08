import React from "react";

const DEFAULT_STYLE = {
  color: "#C92A2A"
};

export default function ErrorFormatter({ value, error, style }) {
  const childStyle = style
    ? Object.assign({}, DEFAULT_STYLE, style)
    : DEFAULT_STYLE;
  return <div style={childStyle} title={error}>{value}</div>;
}
