import { createThunk } from '../create-thunk';

describe('createThunk', () => {
  describe('for passed function, name and scope path creates thunk with correct type', () => {
    test('has a correct type', () => {
      const mockFunction = jest.fn();
      const thunk = createThunk(mockFunction, 'action-name', 'some/scope');

      expect(thunk).toHaveProperty('type');
      expect(thunk.type).toEqual({
        request: 'some/scope/action-name/request',
        success: 'some/scope/action-name/success',
        error: 'some/scope/action-name/error',
      });
    });

    test('thunk is called with correct arguments and produces correct result', async () => {
      const mockFunction = jest.fn((x, y) => x + y);
      const thunk = createThunk(
        mockFunction,
        'my-beautiful-thunk',
        'some/scope',
      );
      const dispatch = jest.fn();
      const result = await thunk(2, 3)(dispatch);
      expect(result).toBe(5);
    });

    test('thunk should dispatch request and success actions', async () => {
      const mockFunction = jest.fn((x, y) => Promise.resolve(x + y));
      const thunk = createThunk(
        mockFunction,
        'my-beautiful-thunk',
        'some/scope',
      );

      const dispatch = jest.fn();
      await thunk(2, 3)(dispatch);

      expect(dispatch).toBeCalledTimes(2);
      expect(dispatch).toBeCalledWith({
        type: 'some/scope/my-beautiful-thunk/request',
        request: [2, 3],
      });
      expect(dispatch).toBeCalledWith({
        type: 'some/scope/my-beautiful-thunk/success',
        request: [2, 3],
        payload: 5,
      });
    });

    test('thunk should dispatch request and error actions', async () => {
      const error = new Error('A little error!');
      const mockFunction = jest.fn(() => {
        throw error;
      });
      const thunk = createThunk(
        mockFunction,
        'my-beautiful-thunk',
        'some/scope',
      );

      const dispatch = jest.fn();
      await thunk('something')(dispatch);

      expect(dispatch).toBeCalledTimes(2);
      expect(dispatch).toBeCalledWith({
        type: 'some/scope/my-beautiful-thunk/request',
        request: ['something'],
      });
      expect(dispatch).toBeCalledWith({
        type: 'some/scope/my-beautiful-thunk/error',
        request: ['something'],
        error,
      });
    });
  });

  test('should generate random action type prefix if scope path is not provided', () => {
    const mockFunction = jest.fn((x, y) => Promise.resolve(x + y));
    const thunk = createThunk(mockFunction, 'my-beautiful-thunk');

    expect(thunk.type.request).toContain('unscoped');
    expect(thunk.type.error).toContain('unscoped');
    expect(thunk.type.success).toContain('unscoped');
  });

  test('should be able to set scope path after creation', async () => {
    const mockFunction = jest.fn((x, y) => Promise.resolve(x + y));
    const thunk = createThunk(mockFunction, 'my-beautiful-thunk');

    thunk.setScope({ path: 'some/lazy/path' });
    const dispatch = jest.fn();
    await thunk(2, 3)(dispatch);

    expect(dispatch).toBeCalledTimes(2);
    expect(dispatch).toBeCalledWith({
      type: 'some/lazy/path/my-beautiful-thunk/request',
      request: [2, 3],
    });
    expect(dispatch).toBeCalledWith({
      type: 'some/lazy/path/my-beautiful-thunk/success',
      request: [2, 3],
      payload: 5,
    });
  });
});
