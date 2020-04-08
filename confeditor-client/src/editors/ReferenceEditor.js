import { connect } from "react-redux";
import ContainerEditorWrapper from "./ContainerEditorWrapper";
import { initialFileContentState } from "../reducers/filesContentReducer";

import "react-select/dist/react-select.css";
import "react-virtualized/styles.css";
import "react-virtualized-select/styles.css";

import AutoCompleteEditor from "./AutoCompleteEditor"

const mapStateToProps = (state, { belongsTo }) => {
  const fileContent = state.filesContent[belongsTo] || initialFileContentState();
  return {
    options: Object.values(fileContent.autoComplete || {})
  };
};

const Container = ContainerEditorWrapper(
  connect(mapStateToProps, null, null, { withRef: true })(AutoCompleteEditor),
  ["disableContainerStyles", "hasResults"]
);

export default Container;
