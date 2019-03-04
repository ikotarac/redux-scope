import _ from 'lodash';
import { combineReducers } from 'redux';
import { createScope } from './create-scope';
import { scopeConfigSymbol } from './scope-config-symbol';

function recursivelyCobmineReducers(scopeConfig) {
  if (_.isEmpty(scopeConfig.reducers) && _.isEmpty(scopeConfig.children)) {
    throw new Error(
      `Scope ${
        scopeConfig.fullScopeName
      } doesn't have any reducers or child scopes attached.`,
    );
  }

  if (_.isEmpty(scopeConfig.children)) {
    return combineReducers(scopeConfig.reducers);
  }

  const childReducers = _.mapValues(scopeConfig.children, childScopeConfig =>
    recursivelyCobmineReducers(childScopeConfig),
  );

  return combineReducers({
    ...childReducers,
    ...scopeConfig.reducers,
  });
}

function resolveRootScope(rootScopeProvider) {
  if (rootScopeProvider[scopeConfigSymbol]) {
    return rootScopeProvider;
  }

  const rootScope = createScope('root');
  _.forEach(rootScopeProvider, rootScope.connectScope);

  return rootScope;
}

export function createRootReducer(
  rootScopeProvider,
  stateSelector = state => state,
) {
  const rootScope = resolveRootScope(rootScopeProvider);
  const root = rootScope[scopeConfigSymbol];
  root.stateSelector = stateSelector;

  return recursivelyCobmineReducers(root);
}
