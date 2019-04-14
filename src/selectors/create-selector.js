import { withScope } from '../with-scope';

export function createSelector(
  selectorInsideScope = state => state,
  stateSelector,
) {
  return withScope(
    scope => state => selectorInsideScope(scope.stateSelector(state)),
    { stateSelector },
  );
}
