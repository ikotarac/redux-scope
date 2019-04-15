import { withScope } from '../with-scope';

export function createActionType(actionName, scope) {
  return `${scope.path}/${actionName}`;
}

export function createAction(actionName, scopePath) {
  return withScope(
    scope => {
      const actionCreator = payload => ({
        type: createActionType(actionName, scope),
        payload,
      });

      Object.defineProperty(actionCreator, 'type', {
        get() {
          return createActionType(actionName, scope);
        },
      });

      return actionCreator;
    },
    { path: scopePath },
    actionName,
  );
}
