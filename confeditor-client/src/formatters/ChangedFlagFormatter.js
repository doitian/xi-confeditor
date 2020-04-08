import React, { Component } from "react";
import PropTypes from "prop-types";

function SimpleCellFormatter({ value }) {
  return <div title={value}>{value}</div>;
}

export default class ChangedFlagFormatter extends Component {
  isChanged() {
    if (!this.context.changes) {
      return false;
    }
    const changedColumns = this.context.changes[this.props.rowIdx];
    if (!changedColumns) {
      return false;
    }

    return !!changedColumns[this.props.column.key];
  }

  render() {
    const formatter = this.props.formatter || SimpleCellFormatter;
    const formatterProps = {
      ...this.props,
      ...(this.props.formatterProps || {})
    };
    delete formatterProps.formatterProps;
    delete formatterProps.formatter;

    const className = this.isChanged() ? 'cellChanged' : '';
    return (
      <div className={className}>
        {React.createElement(formatter, formatterProps)}
      </div>
    );
  }
}

ChangedFlagFormatter.contextTypes = {
  changes: PropTypes.any
};
