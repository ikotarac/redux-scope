import _ from 'lodash';

const SCOPE_PROPS = ['name', 'stateSelector', 'path'];

function getErrorMessage(propertyName, consumerName) {
  if (consumerName) {
    return `Scope property '${propertyName}' not provided for consumer '${consumerName}'. Did you add all scope consumers to a scope?`;
  }

  return `Scope property '${propertyName}' not provided. Did you add all scope consumers to a scope?`;
}

function addPropertyGetter(getters, propertyName, values, consumerName) {
  Object.defineProperty(getters, propertyName, {
    get() {
      const value = values[propertyName];
      if (value) {
        return value;
      }

      throw new Error(getErrorMessage(propertyName, consumerName));
    },
  });
}

export function withScope(initializeConsumer, defaultScope, consumerName) {
  const scopeValues = {};
  function setScope(newScope) {
    _.merge(scopeValues, newScope);
  }

  setScope(defaultScope);

  const scopeGetters = {};
  SCOPE_PROPS.forEach(property =>
    addPropertyGetter(scopeGetters, property, scopeValues, consumerName),
  );

  const scopeConsumer = initializeConsumer(scopeGetters);
  if (!_.isObject(scopeConsumer)) {
    throw new Error(
      'Scope consumer must be object-like (object, function, array).',
    );
  }

  scopeConsumer.setScope = setScope;

  return scopeConsumer;
}
