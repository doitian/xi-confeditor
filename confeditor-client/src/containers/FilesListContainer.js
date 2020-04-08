import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import FilesList from "../components/FilesList";
import {
  boundFetchListIfNeeded,
  openFile,
  setFilter,
  showConfigured,
  invalidateList
} from "../actions";

class FilesListContainer extends Component {
  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps({ filesList }) {
    this.props.boundFetchListIfNeeded(filesList);
  }

  render() {
    const {
      filesList,
      openFile,
      setFilter,
      invalidateList,
      showConfigured
    } = this.props;
    const { names, filter, showConfiguredEnabled } = filesList;
    return (
      <FilesList
        names={names}
        filter={filter}
        openFile={openFile}
        setFilter={setFilter}
        invalidateList={invalidateList}
        showConfiguredEnabled={showConfiguredEnabled}
        showConfigured={showConfigured}
      />
    );
  }
}

const mapStateToProps = state => ({
  filesList: state.filesList
});

const mapDispatchToProps = dispatch => ({
  boundFetchListIfNeeded: filesList =>
    boundFetchListIfNeeded(dispatch, filesList),
  ...bindActionCreators(
    { openFile, setFilter, showConfigured, invalidateList },
    dispatch
  )
});

const Container = connect(mapStateToProps, mapDispatchToProps)(
  FilesListContainer
);

export default Container;
