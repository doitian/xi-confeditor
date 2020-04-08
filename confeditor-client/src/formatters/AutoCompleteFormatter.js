import React from "react";

function selectLabel(option) {
  return option.label;
}

function selectTitle(option) {
  return option.title || option.value;
}

export default function AutoCompleteFormatter({
  value,
  unpack,
  pack,
  options
}) {
  const values = unpack ? unpack(value) : [value];
  const selected = values.map(function(v) {
    return options.find(o => o.value === v) || { value };
  });

  const label = pack
    ? pack(selected.map(selectLabel))
    : selectLabel(selected[0]);
  const title = pack
    ? pack(options.map(selectTitle))
    : selectTitle(selected[0]);

  return <div title={title}>{label}</div>;
}
