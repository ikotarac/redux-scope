import _ from 'lodash';

export function createScope(scopeName, reducer, scopeConsumers) {
  if (!scopeName) {
    throw new Error('No scope name provided.');
  }

  if (!reducer) {
    throw new Error('No reducer provided.');
  }

  if (!_.isFunction(reducer)) {
    throw new Error('Reducer must be a function.');
  }

  return {
    name: scopeName,
    reducer,
    scopeConsumers,
  };
}
