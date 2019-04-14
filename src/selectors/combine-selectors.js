import _ from 'lodash';

export function combineSelectors(selectorsToCombine) {
  return (state, ownProps) =>
    _.mapValues(selectorsToCombine, selector => selector(state, ownProps));
}
