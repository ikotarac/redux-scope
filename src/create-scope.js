import _ from 'lodash';
import { scoped, createSelectors } from 'redux-scope-helpers';
import { scopeConfigSymbol } from './scope-config-symbol';

export function resolveReducerName(reducerFunction, reducerName) {
  if (reducerName) {
    return reducerName;
  }

  if (reducerFunction.name) {
    return reducerFunction.name;
  }

  throw new Error(
    'Reducer function must have name or you must supply reducer name as second argument.',
  );
}

export function checkChildNameAvailability(scopeConfig, childName) {
  const { reducers, children } = scopeConfig;
  if (reducers[childName] || children[childName]) {
    throw new Error(
      `Reducer or child scope with name ${childName} is already connected.`,
    );
  }
}

export function unconnectedStateSelector(scopeName) {
  return () => {
    throw new Error(
      `Trying to use selector from unconnected scope: ${scopeName}.`,
    );
  };
}

export function createScope(scopeName) {
  const scopeConfig = {
    scopeName,
    fullScopeName: scopeName,
    stateSelector: unconnectedStateSelector(scopeName),
    children: {},
    reducers: {},
  };

  function connectReducer(reducer, name) {
    const reducerName = resolveReducerName(reducer, name);
    checkChildNameAvailability(scopeConfig, reducerName);
    scopeConfig.reducers[reducerName] = reducer;

    return createSelectors(
      reducer,
      state => scopeConfig.stateSelector(state)[reducerName],
    );
  }

  function connectScope(childScope) {
    const child = childScope[scopeConfigSymbol];
    const parent = scopeConfig;

    checkChildNameAvailability(parent, child.scopeName);

    child.stateSelector = state => parent.stateSelector(state)[child.scopeName];
    child.fullScopeName = `${parent.fullScopeName}/${child.scopeName}`;
    parent.children[child.scopeName] = child;
  }

  return {
    [scopeConfigSymbol]: scopeConfig,
    connectReducer,
    connectScope,
    ...scoped(() => scopeConfig.fullScopeName),
  };
}
