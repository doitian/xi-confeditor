import React, { Component } from "react";

// Wrapper HOC used when having an editor which is a redux container.
// Required since react-data-grid requires access to getInputNode, getValue,
// howvever when doing this.getEditor() in react-data-grid we get a react
// componenet wrapped by the redux connect function and thus wont have access
// to the required methods.
module.exports = (ContainerEditor, forward = []) => {
  const ContainerEditorWrapper = class ContainerEditorWrapper
    extends Component {
    getInputNode() {
      return this.container.getWrappedInstance().getInputNode();
    }

    getValue() {
      return this.container.getWrappedInstance().getValue();
    }

    render() {
      return (
        <ContainerEditor ref={ref => (this.container = ref)} {...this.props} />
      );
    }
  };

  forward.forEach(function(method) {
    ContainerEditorWrapper.prototype[method] = function(...args) {
      return this.container.getWrappedInstance()[method](...args);
    };
  });

  return ContainerEditorWrapper;
};
