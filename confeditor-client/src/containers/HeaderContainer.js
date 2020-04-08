import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { dismissError, retryError } from "../actions";
import Header from "../components/Header";

const mapStateToProps = ({ errors }) => ({ errors });

const mapDispatchToProps = dispatch =>
  bindActionCreators({ dismissError, retryError }, dispatch);

const HeaderContainer = connect(mapStateToProps, mapDispatchToProps)(Header);

export default HeaderContainer;
