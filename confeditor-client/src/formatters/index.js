import { Formatters as AddonsFormatters } from "react-data-grid-addons";
const { ImageFormatter } = AddonsFormatters;

import ReferenceFormatter from "./ReferenceFormatter";
import AutoCompleteFormatter from "./AutoCompleteFormatter";

const Formatters = {
  ImageFormatter,
  ReferenceFormatter,
  AutoCompleteFormatter,
  DropDownFormatter: AutoCompleteFormatter
};

module.exports = Formatters;
