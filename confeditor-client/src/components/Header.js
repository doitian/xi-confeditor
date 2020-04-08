import React from "react";
import LoadingBar from "react-redux-loading-bar";

import Errors from "./Errors";

export default function Header(props) {
  return (
    <header>
      <LoadingBar />
      <Errors {...props} />
    </header>
  );
}
