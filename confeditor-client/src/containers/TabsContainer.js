import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import Tabs from "../components/Tabs";
import { openFile, closeFile } from "../actions";

const mapStateToProps = state => ({
  names: state.openFiles
});

const mapDispatchToProps = dispatch =>
  bindActionCreators({ openFile, closeFile }, dispatch);

const TabsContainer = connect(mapStateToProps, mapDispatchToProps)(Tabs);

export default TabsContainer;
