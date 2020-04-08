import { Editors as AddonsEditors } from "react-data-grid-addons";
const { DropDownEditor, CheckboxEditor } = AddonsEditors;

import AutoCompleteEditor from "./AutoCompleteEditor";
import ReferenceEditor from "./ReferenceEditor";
import FormEditor from "./FormEditor";
import TextEditor from "./TextEditor"

const Editors = {
  AutoCompleteEditor,
  DropDownEditor,
  TextEditor,
  CheckboxEditor,
  ReferenceEditor,
  FormEditor
};

module.exports = Editors;
