import { createScope } from '../create-scope';
import { createRootReducer } from '../create-root-reducer';

describe('createScope', () => {
  describe('should provide scoped action creators', () => {
    test('for simple actions', () => {
      const { action } = createScope('my-scope');
      const simpleAction = action('simple-action');

      expect(simpleAction.type.success).toEqual(
        'my-scope/simple-action/success',
      );
    });

    test('scoped action creators should support scope nesting', () => {
      const parentScope = createScope('parent-scope');
      const childScope = createScope('child-scope');

      parentScope.connectScope(childScope);

      const simpleAction = childScope.action('simple-action');
      expect(simpleAction.type.success).toEqual(
        'parent-scope/child-scope/simple-action/success',
      );
    });
  });

  test('nested selectors should work magically', () => {
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

    const { name1, surname1 } = parentScope.connectReducer(reducer1);
    const { name2, surname2 } = childScope.connectReducer(reducer2);

    createRootReducer(parentScope);

    const bigState = {
      'child-scope': { reducer2: { name2: 'Joanna', surname2: 'Doe' } },
      reducer1: { name1: 'John', surname1: 'Doe' },
    };

    expect(name1(bigState)).toEqual('John');
    expect(surname1(bigState)).toEqual('Doe');
    expect(name2(bigState)).toEqual('Joanna');
    expect(surname2(bigState)).toEqual('Doe');
  });
});
