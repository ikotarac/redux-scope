/* eslint-disable no-unused-vars */
import { createAction } from '../../actions';
import { createSelector } from '../../selectors';
import { createScope } from '../create-scope';
import { combineScopes } from '../combine-scopes';

describe('createScope', () => {
  test('should create object with correct structure', () => {
    function reducer1(state = {}, action) {
      return state;
    }
    function reducer2(state = {}, action) {
      return state;
    }
    const action1 = createAction('action-name-1');
    const action2 = createAction('action-name-2');
    const selector1 = createSelector(state => state);
    const selector2 = createSelector(state => state);

    const scope1 = createScope('scope1', reducer1, { action1, selector1 });
    const scope2 = createScope('scope2', reducer2, { action2, selector2 });
    const combinedScope = combineScopes('combined-scope', { scope1, scope2 });

    expect(combinedScope).toEqual({
      name: 'combined-scope',
      children: {
        scope1: {
          name: 'scope1',
          reducer: reducer1,
          scopeConsumers: { action1, selector1 },
        },
        scope2: {
          name: 'scope2',
          reducer: reducer2,
          scopeConsumers: { action2, selector2 },
        },
      },
    });
  });

  test('should throw if name for combined scope is not specified', () => {
    expect(() => combineScopes()).toThrowError(
      'No name provided for combined scope.',
    );
  });

  test('should throw if child scopes are not provided', () => {
    expect(() => combineScopes('name')).toThrowError(
      'No children provided for combined scope.',
    );

    expect(() => combineScopes('name', {})).toThrowError(
      'No children provided for combined scope.',
    );
  });
});
