import _ from 'lodash';
import { createSelector } from './create-selector';

function resolveInitialState(stateShapeProvider) {
  if (_.isFunction(stateShapeProvider)) {
    const reducer = stateShapeProvider;
    return reducer(undefined, { type: undefined });
  }

  if (_.isObject(stateShapeProvider)) {
    return stateShapeProvider;
  }

  throw new Error('Please provide default state or reducer.');
}

export function createSelectors(stateShapeProvider, stateSelector) {
  const defaultState = resolveInitialState(stateShapeProvider);

  return _.mapValues(defaultState, (defaultValue, key) =>
    createSelector(
      _.property(key),
      stateSelector,
    ),
  );
}
