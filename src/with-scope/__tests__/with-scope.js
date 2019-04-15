import { withScope } from '../with-scope';

describe('withScope', () => {
  test('should initialize scope consumer with provided scope properties', () => {
    const initConsumer = jest.fn(scope => scope);

    const stateSelector = state => state;
    const scopeConsumer = withScope(initConsumer, {
      path: 'bla/bla',
      stateSelector,
    });

    expect(scopeConsumer).toHaveProperty('path', 'bla/bla');
    expect(scopeConsumer).toHaveProperty('stateSelector', stateSelector);
  });

  test('scope consumer should have setScope method that changes scope', () => {
    const initConsumer = jest.fn(scope => ({
      getName: () => scope.name,
    }));

    const stateSelector = state => state;
    const scopeConsumer = withScope(initConsumer, {
      path: 'bla/bla',
      stateSelector,
    });

    expect(scopeConsumer).toHaveProperty('setScope');
    scopeConsumer.setScope({ name: 'bla' });
    expect(scopeConsumer.getName()).toEqual('bla');
  });

  test('should throw if scope consumer reads unset values from scope', () => {
    const initConsumer = jest.fn(scope => ({
      getName: () => scope.name,
    }));

    const stateSelector = state => state;
    const scopeConsumer = withScope(initConsumer, {
      path: 'bla/bla',
      stateSelector,
    });

    expect(() => scopeConsumer.getName()).toThrowError(
      "Scope property 'name' not provided.",
    );
  });

  test('should throw if returned scope consumer is not object-like (is not able to have properties)', () => {
    expect(() => withScope(() => null)).toThrowError(
      'Scope consumer must be object-like',
    );

    expect(() => withScope(() => undefined)).toThrowError(
      'Scope consumer must be object-like',
    );

    expect(() => withScope(() => 1)).toThrowError(
      'Scope consumer must be object-like',
    );

    expect(() => withScope(() => 'some-string')).toThrowError(
      'Scope consumer must be object-like',
    );

    expect(() =>
      withScope(() => ({
        some: 'thing',
      })),
    ).not.toThrowError('Scope consumer must be object-like');

    expect(() => withScope(() => [1, 2, 'bla'])).not.toThrowError(
      'Scope consumer must be object-like',
    );

    expect(() => withScope(scope => () => scope.name)).not.toThrowError(
      'Scope consumer must be object-like',
    );
  });

  test('scope consumer should read values initialized lazily using setScope method', () => {
    const initConsumer = jest.fn(scope => scope);

    const stateSelector = state => state;
    const scopeConsumer = withScope(initConsumer);
    scopeConsumer.setScope({
      path: 'bla/bla',
      stateSelector,
    });

    expect(scopeConsumer).toHaveProperty('path', 'bla/bla');
    expect(scopeConsumer).toHaveProperty('stateSelector', stateSelector);
  });
});
