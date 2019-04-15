/* eslint-disable no-unused-vars */
import { createSelectors } from '../create-selectors';

describe('createSelectors', () => {
  test('should create selectors from given state prototype object (e.g. initial state)', () => {
    const demoState = {
      scope: {
        property1: 'bla',
        property2: 2,
      },
    };

    const { property1, property2 } = createSelectors(
      demoState.scope,
      state => state.scope,
    );

    expect(property1(demoState)).toEqual('bla');
    expect(property2(demoState)).toEqual(2);
  });

  test('should create selectors from given reducer', () => {
    const initialState = {
      property1: null,
      property2: null,
    };

    function reducer(state = initialState, action) {
      return state;
    }

    const { property1, property2 } = createSelectors(
      reducer,
      state => state.scope,
    );

    const state = {
      scope: {
        property1: 'something',
        property2: 0,
      },
    };

    expect(property1(state)).toEqual('something');
    expect(property2(state)).toEqual(0);
  });

  test('selectors prouced from prototype state should be able to set scope lazily', () => {
    const demoState = {
      scope: {
        property1: 'bla',
        property2: 2,
      },
    };

    const { property1, property2 } = createSelectors(demoState.scope);

    property1.setScope({ stateSelector: state => state.scope });
    property2.setScope({ stateSelector: state => state.scope });

    expect(property1(demoState)).toEqual('bla');
    expect(property2(demoState)).toEqual(2);
  });

  test('selectors produced from a reducer should be able to set scope lazily', () => {
    const initialState = {
      property1: null,
      property2: null,
    };

    function reducer(state = initialState, action) {
      return state;
    }

    const { property1, property2 } = createSelectors(reducer);
    property1.setScope({ stateSelector: state => state.scope });
    property2.setScope({ stateSelector: state => state.scope });

    const state = {
      scope: {
        property1: 'something',
        property2: 0,
      },
    };

    expect(property1(state)).toEqual('something');
    expect(property2(state)).toEqual(0);
  });

  test('should throw if selector is used with uninitialized state selector', () => {
    const demoState = {
      scope: {
        property1: 'bla',
        property2: 2,
      },
    };

    const { property1, property2 } = createSelectors(demoState.scope);

    property1.setScope({ stateSelector: state => state.scope });

    expect(property1(demoState)).toEqual('bla');
    expect(() => property2(demoState)).toThrowError(
      "Scope property 'stateSelector' not provided.",
    );
  });

  test('should throw if no arguments are provided', () => {
    expect(() => createSelectors()).toThrowError(
      'Please provide default state or reducer.',
    );
  });
});
