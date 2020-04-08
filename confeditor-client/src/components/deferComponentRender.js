// https://gist.github.com/paularmstrong/cc2ead7e2a0dec37d8b2096fc8d85759#file-defercomponentrender-js
import hoistStatics from "hoist-non-react-statics";
import React from "react";

/**
 * Allows two animation frames to complete to allow other components to update
 * and re-render before mounting and rendering an expensive `WrappedComponent`.
 */
export default function deferComponentRender(WrappedComponent) {
  if (window.requestAnimationFrame === undefined) {
    return WrappedComponent;
  }

  class DeferredRenderWrapper extends React.Component {
    constructor(props, context) {
      super(props, context);
      this.state = { shouldRender: false };
      this.waiting = true;
    }

    componentWillReceiveProps(nextProps) {
      if (
        this.state.shouldRender &&
        !this.waiting &&
        nextProps.shouldDefer &&
        nextProps.shouldDefer(this.props, nextProps)
      ) {
        this.waiting = true;
        this.setState({ shouldRender: false });
      }
    }

    componentDidMount() {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          this.setState({ shouldRender: true });
          this.waiting = false;
        });
      });
    }

    componentDidUpdate() {
      if (this.waiting && !this.state.shouldRender) {
        this.componentDidMount();
      }
    }

    render() {
      return this.state.shouldRender
        ? <WrappedComponent {...this.props} />
        : null;
    }
  }

  return hoistStatics(DeferredRenderWrapper, WrappedComponent);
}
