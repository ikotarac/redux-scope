import { withScope } from '../with-scope';

export function createThunkType(actionName, scope) {
  return {
    get request() {
      return `${scope.path}/${actionName}/request`;
    },
    get success() {
      return `${scope.path}/${actionName}/success`;
    },
    get error() {
      return `${scope.path}/${actionName}/error`;
    },
  };
}

export function createThunk(actionFunction, actionName, scopePath) {
  return withScope(
    scope => {
      const type = createThunkType(actionName, scope);

      const actionCreator = (...args) => async dispatch => {
        const request = args;
        dispatch({ type: type.request, request });
        try {
          const payload = await actionFunction(...args);
          dispatch({ type: type.success, request, payload });
          return payload;
        } catch (error) {
          dispatch({ type: type.error, request, error });
        }
      };

      actionCreator.type = type;

      return actionCreator;
    },
    { path: scopePath },
  );
}
