import React, { Component } from "react";
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import { Provider } from "react-redux";
import { createStore, applyMiddleware, compose } from "redux";
import createSagaMiddleware from "redux-saga";
import { Grid, Modal, Button, Alert } from "react-bootstrap";
import { batchStoreEnhancer, batchMiddleware } from "redux-batch-enhancer";
import {
  getStoredState,
  createPersistor,
  createTransform
} from "redux-persist";
import localForage from 'localforage'

import rootReducer from "./reducers/rootReducer";
import rootSaga from "./sagas/rootSaga";
import { initialFileContentState } from "./reducers/filesContentReducer";

import HeaderContainer from "./containers/HeaderContainer";
import FilesListContainer from "./containers/FilesListContainer";
import FileEditorContainer from "./containers/FileEditorContainer";
import TabsContainer from "./containers/TabsContainer";

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const sagaMiddleware = createSagaMiddleware();
const defaultFileContentState = initialFileContentState();
let changesTransform = createTransform(
  // transform state coming from redux on its way to being serialized and stored
  (inboundState, key) => {
    const serialized = {};
    for (const fileName in inboundState) {
      const fileContent = inboundState[fileName];
      if (fileContent.changes.length > 0) {
        serialized[fileName] = fileContent.changes;
      }
    }
    return serialized;
  },
  // transform state coming from storage, on its way to be rehydrated into redux
  (outboundState, key) => {
    const deserialzied = {};
    for (const fileName in outboundState) {
      const changes = outboundState[fileName];
      deserialzied[fileName] = { ...defaultFileContentState, changes };
    }
    return deserialzied;
  },
  // configuration options
  { whitelist: ["filesContent"] }
);
const persistConfig = {
  transforms: [changesTransform],
  whitelist: ["updatedAt", "filesContent"],
  storage: localForage
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { store: null, restoredState: null };
  }

  componentDidMount() {
    getStoredState(persistConfig, (err, restoredState) => {
      if (err != null) {
        console.log(err);
      }

      if (err == null && this.hasUnsavedChanges(restoredState)) {
        this.setState({ restoredState });
        return;
      }

      this.setState({ store: this.createStore() });
    });
  }

  hasUnsavedChanges(state) {
    if (state.updatedAt === undefined || state.updatedAt === null) {
      return false;
    }

    for (const name in state.filesContent) {
      const fileContent = state.filesContent[name];
      if (fileContent.changes && fileContent.changes.length > 0) {
        return true;
      }
    }

    return false;
  }

  createStore(preloadedState = {}) {
    const store = createStore(
      rootReducer,
      preloadedState,
      composeEnhancers(
        applyMiddleware(batchMiddleware, sagaMiddleware),
        batchStoreEnhancer
      )
    );
    createPersistor(store, persistConfig);
    sagaMiddleware.run(rootSaga);
    return store;
  }

  restoreUnsavedChanges = () => {
    this.setState({ store: this.createStore(this.state.restoredState) });
  };

  purgeUnsavedChanges = () => {
    this.setState({ store: this.createStore() });
  };

  renderUnsavedChanges(state) {
    const changedFiles = [];
    for (const name in state.filesContent) {
      const fileContent = state.filesContent[name];
      if (fileContent.changes && fileContent.changes.length > 0) {
        changedFiles.push(
          <li key={name}>
            {name} 有 {fileContent.changes.length} 行改动未保存
          </li>
        );
      }
    }

    const lastUpdatedAt = new Date();
    lastUpdatedAt.setTime(state.updatedAt);

    return (
      <div>
        <p>最后一次修改于 {lastUpdatedAt.toLocaleString()}</p>
        <ul>{changedFiles}</ul>
      </div>
    );
  }

  render() {
    if (this.state.store) {
      return (
        <Provider store={this.state.store}>
          <Router>
            <div>
              <HeaderContainer />
              <Grid fluid style={{ paddingTop: "5px" }}>
                <Switch>
                  <Route exact path="/" component={TabsContainer} />
                  <Route path="/e/:name" component={TabsContainer} />
                </Switch>

                <br />
                <Switch>
                  <Route exact path="/" component={FilesListContainer} />
                  <Route path="/e/:name" component={FileEditorContainer} />
                </Switch>
              </Grid>
            </div>
          </Router>
        </Provider>
      );
    }

    if (this.state.restoredState) {
      return (
        <Modal.Dialog>
          <Modal.Header>
            <Modal.Title>数据恢复</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <p>发现有未保存的修改，选择恢复可以继续上次的编辑。<strong>选择放弃的话数据将无法再恢复</strong>。</p>

            {this.renderUnsavedChanges(this.state.restoredState)}
          </Modal.Body>

          <Modal.Footer>
            <Button bsStyle="danger" onClick={this.purgeUnsavedChanges}>
              放弃修改
            </Button>
            <Button bsStyle="primary" onClick={this.restoreUnsavedChanges}>
              恢复数据
            </Button>
          </Modal.Footer>

        </Modal.Dialog>
      );
    }

    return (
      <Alert style={{ maxWidth: "200px", margin: "20px auto" }} bsStyle="info">
        加载中...
      </Alert>
    );
  }
}

export default App;
