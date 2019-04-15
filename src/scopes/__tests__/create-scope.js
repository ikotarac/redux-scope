/* eslint-disable no-unused-vars */
import { createAction } from '../../actions';
import { createSelector } from '../../selectors';
import { createScope } from '../create-scope';

describe('createScope', () => {
  test('should create object with correct structure', () => {
    function reducer(state = {}, action) {
      return state;
    }
    const action = createAction('action-name');
    const selector = createSelector(state => state);

    const scope = createScope('name', reducer, { action, selector });

    expect(scope).toEqual({
      name: 'name',
      reducer,
      scopeConsumers: { action, selector },
    });
  });

  test('should throw if scope name is not specified', () => {
    expect(() => createScope()).toThrowError('No scope name provided.');
  });

  test('should throw if reducer is not provided', () => {
    expect(() => createScope('name')).toThrowError('No reducer provided.');
  });

  test('should throw if reducer is not a function', () => {
    expect(() =>
      createScope('name', { mistake: 'not-a-function' }),
    ).toThrowError('Reducer must be a function.');
  });
});
