import { connect } from "react-redux";
import { initialFileContentState } from "../reducers/filesContentReducer";
import AutoCompleteControl from "./AutoCompleteControl";

const mapStateToProps = (state, { belongsTo }) => {
  const fileContent = state.filesContent[belongsTo] || initialFileContentState()
  return {
    options: Object.values(fileContent.autoComplete || {})
  };
};

const Container = connect(mapStateToProps)(AutoCompleteControl);

export default Container;
