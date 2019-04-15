import { createSelector } from '../create-selector';

describe('createSelector', () => {
  test('should compose selector from two parts - inside scope selector and scope state selector', () => {
    const demoState = {
      scope: {
        someProperty: 5,
      },
    };

    const selector = createSelector(
      state => state.someProperty,
      state => state.scope,
    );

    expect(selector(demoState)).toEqual(5);
  });

  test('should be able to set scope state selector lazily', () => {
    const demoState = {
      scope: {
        someProperty: 'bla',
      },
    };

    const selector = createSelector(state => state.someProperty);
    selector.setScope({ stateSelector: state => state.scope });

    expect(selector(demoState)).toEqual('bla');
  });

  test('if no parameters are passed, produces state selector for the scope it belongs to', () => {
    const demoState = {
      scope: {
        someProperty: 'bla',
      },
    };

    const selector = createSelector();
    selector.setScope({ stateSelector: state => state.scope });

    expect(selector(demoState)).toEqual({
      someProperty: 'bla',
    });
  });

  test('should throw if selector is used with uninitialized state selector', () => {
    const demoState = {
      scope: {
        someProperty: 'bla',
      },
    };

    const selector = createSelector(state => state.someProperty);

    expect(() => selector(demoState)).toThrowError(
      "Scope property 'stateSelector' not provided.",
    );
  });
});
