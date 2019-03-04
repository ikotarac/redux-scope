import { createScope } from '../create-scope';
import { createRootReducer } from '../create-root-reducer';

describe('createRootReducer', () => {
  test('should create reducer with correct shape', () => {
    const defaultState1 = {
      name1: 'John',
      surname1: 'Doe',
    };

    function reducer1(state = defaultState1, action) {
      return state;
    }

    const defaultState2 = {
      name2: 'Joanna',
      surname2: 'Doe',
    };

    function reducer2(state = defaultState2, action) {
      return state;
    }

    const parentScope = createScope('parent-scope');
    const childScope = createScope('child-scope');
    parentScope.connectScope(childScope);

    parentScope.connectReducer(reducer1);
    childScope.connectReducer(reducer2);

    const rootReducer = createRootReducer(parentScope);
    const bigState = {
      'child-scope': { reducer2: { name2: 'Joanna', surname2: 'Doe' } },
      reducer1: { name1: 'John', surname1: 'Doe' },
    };

    expect(rootReducer()).toEqual(bigState);
  });

  test('should create reducer when child scopes passed directly', () => {
    const defaultState1 = {
      name1: 'John',
      surname1: 'Doe',
    };

    function reducer1(state = defaultState1, action) {
      return state;
    }

    const defaultState2 = {
      name2: 'Joanna',
      surname2: 'Doe',
    };

    function reducer2(state = defaultState2, action) {
      return state;
    }

    const scope1 = createScope('scope-1');
    const scope2 = createScope('scope-2');

    scope1.connectReducer(reducer1);
    scope2.connectReducer(reducer2);

    const rootReducer = createRootReducer({ scope1, scope2 });
    const rootInitialState = {
      'scope-1': { reducer1: { name1: 'John', surname1: 'Doe' } },
      'scope-2': { reducer2: { name2: 'Joanna', surname2: 'Doe' } },
    };

    expect(rootReducer()).toEqual(rootInitialState);
  });
});
