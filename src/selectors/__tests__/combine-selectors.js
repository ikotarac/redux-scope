import { createSelector } from '../create-selector';
import { createSelectors } from '../create-selectors';
import { combineSelectors } from '../combine-selectors';

describe('combineSelectors', () => {
  test('should create mapStateToProps from given map of selectors', () => {
    const state = {
      scope: {
        property: 'bla',
      },
      otherScope: {
        someProperty: 3,
        items: ['car', 'cat', 'umbrella'],
      },
    };

    const propertySelector = createSelector(state => state.property);
    propertySelector.setScope({ stateSelector: state => state.scope });

    const { someProperty, items } = createSelectors(
      state.otherScope,
      state => state.otherScope,
    );

    const itemSelector = (state, itemIndex) => items(state)[itemIndex];
    const itemSelectorWithProps = (state, { itemIndex }) =>
      items(state)[itemIndex];

    const mapStateToProps = combineSelectors({
      propertySelector,
      someProperty,
      items,
      item: (state, { itemIndex }) => itemSelector(state, itemIndex),
      alsoItem: itemSelectorWithProps,
    });

    const props = mapStateToProps(state, { itemIndex: 1 });

    expect(props).toEqual({
      propertySelector: 'bla',
      someProperty: 3,
      items: ['car', 'cat', 'umbrella'],
      item: 'cat',
      alsoItem: 'cat',
    });

    const otherProps = mapStateToProps(state, { itemIndex: 2 });

    expect(otherProps).toEqual({
      propertySelector: 'bla',
      someProperty: 3,
      items: ['car', 'cat', 'umbrella'],
      item: 'umbrella',
      alsoItem: 'umbrella',
    });
  });
});
