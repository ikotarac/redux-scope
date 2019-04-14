import _ from 'lodash';
import { combineReducers } from 'redux';

function resolvePath(scopePath, scopeName) {
  if (scopePath) {
    return `${scopePath}/${scopeName}`;
  }

  return scopeName;
}

function resolveStateSelector(rootSelector, parentScopes, name) {
  return state => _.get(rootSelector(state), [...parentScopes, name]);
}

function walkScopesTree(scope, rootSelector, parentScopes, parentPath) {
  const { name } = scope;
  const resolvedPath = resolvePath(parentPath, name);
  const resolvedStateSelector = resolveStateSelector(
    rootSelector,
    parentScopes,
    name,
  );

  // handle leaf scope
  if (scope.reducer) {
    const { scopeConsumers, reducer } = scope;

    _.forEach(scopeConsumers, consumer =>
      consumer.setScope({
        stateSelector: resolvedStateSelector,
        path: resolvedPath,
      }),
    );

    return reducer;
  }

  const { children } = scope;
  const childReducers = {};

  _.forEach(children, child => {
    const childReducer = walkScopesTree(
      child,
      rootSelector,
      [...parentScopes, name],
      resolvedPath,
    );
    childReducers[child.name] = childReducer;
  });

  return combineReducers(childReducers);
}

export function createRootReducer(scopes, rootSelector = state => state) {
  const topLevelReducers = {};
  _.forEach(scopes, scope => {
    const scopeReducer = walkScopesTree(scope, rootSelector, [], null);
    topLevelReducers[scope.name] = scopeReducer;
  });

  return combineReducers(topLevelReducers);
}
