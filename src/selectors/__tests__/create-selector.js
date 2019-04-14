import { createSelector } from '../create-selector';

describe('createSelector', () => {
  test('should compose selector from two parts - inside scope selector and scope state selector', () => {
    const state = {
      scope: {
        someProperty: 5,
      },
    };

    const selector = createSelector(
      state => state.someProperty,
      state => state.scope,
    );

    expect(selector(state)).toEqual(5);
  });

  test('should be able to set scope state selector lazily', () => {
    const state = {
      scope: {
        someProperty: 'bla',
      },
    };

    const selector = createSelector(state => state.someProperty);
    selector.setScope({ stateSelector: state => state.scope });

    expect(selector(state)).toEqual('bla');
  });

  test('if no parameters are passed, produces state selector for the scope it belongs to', () => {
    const state = {
      scope: {
        someProperty: 'bla',
      },
    };

    const selector = createSelector();
    selector.setScope({ stateSelector: state => state.scope });

    expect(selector(state)).toEqual({
      someProperty: 'bla',
    });
  });

  test('should throw if selector is used with uninitialized state selector', () => {
    const state = {
      scope: {
        someProperty: 'bla',
      },
    };

    const selector = createSelector(state => state.someProperty);

    expect(() => selector(state)).toThrowError(
      `Scope property 'stateSelector' not provided.`,
    );
  });
});
