import React from "react";
import { Alert, Button } from "react-bootstrap";

const outterStyle = {
  position: "fixed",
  width: "320px",
  maxWidth: "95%",
  top: "5px",
  right: "5px",
  zIndex: "9999999"
};

function ErrorAlert({ error, dismissError, retryError }) {
  const onDismiss = error ? () => dismissError(error) : () => {};
  return (
    <Alert bsStyle="danger" onDismiss={onDismiss}>
      <p>{error.message}</p>
      {error.action &&
        <p>
          <Button onClick={() => retryError(error)}>重试</Button>
        </p>}
    </Alert>
  );
}

export default function Errors({ errors = [], dismissError, retryError }) {
  return (
    <div style={outterStyle}>
      {errors.map(e => (
        <ErrorAlert key={e.uuid} error={e} {...{ dismissError, retryError }} />
      ))}
    </div>
  );
}
