import { createAction } from '../create-action';

describe('createAction', () => {
  describe('for passed string creates action creator', () => {
    test('has a correct type', () => {
      const action = createAction('action-name', 'some/scope');

      expect(action).toHaveProperty('type');
      expect(action.type).toEqual('some/scope/action-name');
    });

    test('passes the argument as action payload', () => {
      const action = createAction('action-name', 'some/scope');

      expect(action(1)).toEqual({
        type: 'some/scope/action-name',
        payload: 1,
      });
    });
  });

  test('should throw error if scope path is not provided', () => {
    const action = createAction('action-name');
    expect(() => action(1)).toThrowError(`Scope property 'path' not provided.`);
  });

  test('should be able to set scope path after creation', () => {
    const action = createAction('action-name');
    action.setScope({ path: 'some/lazy/path' });

    expect(action.type).toEqual('some/lazy/path/action-name');
    expect(action(1)).toEqual({
      type: 'some/lazy/path/action-name',
      payload: 1,
    });
  });
});
