import _ from 'lodash';

const SCOPE_PROPS = ['name', 'stateSelector', 'path'];

function addPropertyGetter(getters, propertyName, values) {
  Object.defineProperty(getters, propertyName, {
    get() {
      const value = values[propertyName];
      if (value) {
        return value;
      }

      throw new Error(
        `Scope property '${propertyName}' not provided. Did you forget to add all scope consumers to a scope?`,
      );
    },
  });
}

export function withScope(initializeConsumer, defaultScope) {
  const scopeValues = {};
  function setScope(newScope) {
    _.merge(scopeValues, newScope);
  }

  setScope(defaultScope);

  const scopeGetters = {};
  SCOPE_PROPS.forEach(property =>
    addPropertyGetter(scopeGetters, property, scopeValues),
  );

  const scopeConsumer = initializeConsumer(scopeGetters);
  if (!_.isObject(scopeConsumer)) {
    throw new Error(
      `Scope consumer must be object-like (object, function, array).`,
    );
  }

  scopeConsumer.setScope = setScope;

  return scopeConsumer;
}
