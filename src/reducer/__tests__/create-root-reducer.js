/* eslint-disable no-unused-vars */
import { createScope, combineScopes } from '../../scopes';
import { createAction, createThunk } from '../../actions';
import { createSelector, createSelectors } from '../../selectors';
import { createRootReducer } from '../create-root-reducer';

describe('createRootReducer', () => {
  test('should produce reducer with correct shape', () => {
    function reducer1(state = { prop1: 1 }, action) {
      return state;
    }
    function reducer2(state = { prop2: 2 }, action) {
      return state;
    }
    function reducer3(state = { prop3: 3 }, action) {
      return state;
    }

    const scope1 = createScope('scope1', reducer1);
    const scope2 = createScope('scope2', reducer2);
    const scope3 = createScope('scope3', reducer3);

    const combinedScope = combineScopes('combinedScope', { scope1, scope2 });
    const rootReducer = createRootReducer({
      combinedScope,
      scope3,
    });

    expect(rootReducer(undefined, { type: 'init' })).toEqual({
      combinedScope: {
        scope1: {
          prop1: 1,
        },
        scope2: {
          prop2: 2,
        },
      },
      scope3: { prop3: 3 },
    });
  });

  test('should initialize action creators to correct scope', () => {
    const action1 = createAction('action1');
    const action2 = createAction('action2');
    const action3 = createAction('action3');

    function reducer1(state = { prop1: 1 }, action) {
      switch (action.type) {
        case action1.type:
        default:
          return state;
      }
    }
    function reducer2(state = { prop2: 2 }, action) {
      return state;
    }
    function reducer3(state = { prop3: 3 }, action) {
      return state;
    }

    const scope1 = createScope('scope1', reducer1, { action1 });
    const scope2 = createScope('scope2', reducer2, { action2 });
    const scope3 = createScope('scope3', reducer3, { action3 });

    const combinedScope = combineScopes('combinedScope', { scope1, scope2 });
    const rootReducer = createRootReducer({
      combinedScope,
      scope3,
    });

    expect(action1.type).toEqual('combinedScope/scope1/action1');
    expect(action2.type).toEqual('combinedScope/scope2/action2');
    expect(action3.type).toEqual('scope3/action3');
  });

  test('should initialize thunk creators to correct scope', () => {
    const thunk1 = createThunk(() => null, 'thunk1');
    const thunk2 = createThunk(() => null, 'thunk2');
    const thunk3 = createThunk(() => null, 'thunk3');

    function reducer1(state = { prop1: 1 }, action) {
      switch (action.type) {
        case thunk1.type.request:
        case thunk1.type.error:
        case thunk1.type.success:
        default:
          return state;
      }
    }
    function reducer2(state = { prop2: 2 }, action) {
      return state;
    }
    function reducer3(state = { prop3: 3 }, action) {
      return state;
    }

    const scope1 = createScope('scope1', reducer1, { thunk1 });
    const scope2 = createScope('scope2', reducer2, { thunk2 });
    const scope3 = createScope('scope3', reducer3, { thunk3 });

    const combinedScope = combineScopes('combinedScope', { scope1, scope2 });
    const rootReducer = createRootReducer({
      combinedScope,
      scope3,
    });

    expect(thunk1.type).toEqual({
      error: 'combinedScope/scope1/thunk1/error',
      request: 'combinedScope/scope1/thunk1/request',
      success: 'combinedScope/scope1/thunk1/success',
    });
    expect(thunk2.type).toEqual({
      error: 'combinedScope/scope2/thunk2/error',
      request: 'combinedScope/scope2/thunk2/request',
      success: 'combinedScope/scope2/thunk2/success',
    });
    expect(thunk3.type).toEqual({
      error: 'scope3/thunk3/error',
      request: 'scope3/thunk3/request',
      success: 'scope3/thunk3/success',
    });
  });

  test('should initialize selectors to correct scope', () => {
    function reducer1(state = { prop1: 1 }, action) {
      return state;
    }
    function reducer2(state = { prop2: 2 }, action) {
      return state;
    }
    function reducer3(state = { prop31: 31, prop32: 32 }, action) {
      return state;
    }

    const selector1 = createSelector(state => state.prop1);
    const selector2 = createSelector(state => state.prop2);
    const { prop31, prop32 } = createSelectors(reducer3);

    const scope1 = createScope('scope1', reducer1, { selector1 });
    const scope2 = createScope('scope2', reducer2, { selector2 });
    const scope3 = createScope('scope3', reducer3, { prop31, prop32 });

    const combinedScope = combineScopes('combinedScope', { scope1, scope2 });
    const rootReducer = createRootReducer({
      combinedScope,
      scope3,
    });

    const state = rootReducer(undefined, { type: 'init' });

    expect(selector1(state)).toEqual(1);
    expect(selector2(state)).toEqual(2);
    expect(prop31(state)).toEqual(31);
    expect(prop32(state)).toEqual(32);
  });
});
