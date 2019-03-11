# Redux Scope 🔭

Reduce Redux boilerplate and improve modularity.

Redux scope logically brings together _actions_, _action types_, _reducers_ and _selectors_.
It puts the focus on **reducers** and the **state**, making them modular and well organised, sparing you from writing boilerplate and doing all the wiring manually.

_**Disclaimer.**_ Current test coverage is basic, just confirming that basic concepts work well. Until completely covered with tests, this package should be considered experimental.

## Installation

`npm install redux-scope`

## Usage

```javascript
const preferencesScope = createScope('preferences');
const { createAction, connectReducer } = preferencesScope;

// create action creator and its type
const setFontSize = createAction('set-font-size');

function preferences(state = { fontSize: 'small' }, action) {
  switch (action.type) {
    case setFontSize.type: // 'preferences/set-font-size'
      return {
        ...state,
        fontSize: action.payload,
      };
    default:
      return state;
  }
}

// connect reducer, and get selectors based on the shape of the default state
const { fontSize } = connectReducer(preferences);
```

## Creating thunks

```javascript
import createScope from 'redux-scope';
import { fetchUserDataAsync } from './my-user-api';

const userProfileScope = createScope('user');
const { createAction, connectReducer } = userProfileScope;

// creates a thunk with corresponding request, success and error actions
const fetchUser = createAction(fetchUserDataAsync, 'fetch-user');

const userDefault = {
  data: null,
  loading: false,
  error: null,
};

function user(state = userDefault, action) {
  switch (action.type) {
    // value: 'user/fetch-user/request'
    case fetchUser.type.request:
      return {
        ...state,
        loading: true,
        error: null,
      };
    // 'user/fetch-user/success'
    case fetchUser.type.success:
      return {
        ...state,
        data: action.payload,
        loading: false,
        error: null,
      };
    // 'user/fetch-user/error'
    case fetchUser.type.error:
      return {
        ...state,
        loading: false,
        error: action.error,
      };
    default:
      return state;
  }
}

const { data, loading, error } = connectReducer(user);

// you can connect more reducers to a single scope
const addToFavorites = createAction('add-to-favorites');

function favorites(state = [], action) {
  switch(action.type) {
    case addToFavorites.type:
      return [...state, action.payload],
    default:
      return state;
  }
}

const getFavorites = connectReducer(favorites);
```

You can now export your action creators and selectors and use them as usual:

```javascript
dispatch(addToFavorites({ userId: 123 }));
const favorites = getFavorites(state); // [{ userId: 123 }]
```

### Getting root reducer

When you're ready to create your redux store, just use the root scope to get the root reducer:

```javascript
// import createStore, ...
import { createRootReducer } from 'redux-scope';
import { userProfileScope } from './user-profile';

const rootReducer = createRootReducer(userProfileScope);
const store = createStore(rootReducer, applyMiddleware(thunk));
```

### Remarks

✨ Generated root reducer produces state with the following shape:

```json
{
  "user": {
    "data": null,
    "error": null,
    "loading": false
  },
  "favorites": []
}
```

✨ All selectors are wired automatically, they recieve root state and work everywhere:

```javascript
loading(state); // false
fontSize(state); // 'small'
```

## Composing scopes

Redux scopes can be nested. We have already created two scopes named `user` and `preferences`. Now let's connect `preferences` scope as a child of the scope `user`, and create root reducer.

```javascript
// import createStore, ...
import { createRootReducer } from 'redux-scope';
import { userScope } from './user';
import { preferencesScope } from './preferences';

userScope.connectScope(preferencesScope);

const rootReducer = createRootReducer(userScope);
const store = createStore(rootReducer, applyMiddleware(thunk));
```

Now, generated state looks like this:

```json
{
  "user": {
    "data": null,
    "error": null,
    "loading": false
  },
  "favorites": [],
  "preferences": {
    "preferences": {
      "fontSize": "small"
    }
  }
}
```

✨ All reducers in a child scope are combined together using `combineReducers` before being merged with reducers that belong to the parent scope

✨ This combined reducer is named after the scope it belongs to, in this case `preferences`

### Scopes can be nested in any arrangement

We can do the nesting the other way around, `preferencesScope.connectScope(userScope)`, or we can create a new scope just to contain all the child scopes:

```javascript
const appScope = createScope('app');
appScope.connectScope(userScope);
appScope.connectScope(preferencesScope);

const rootReducer = createRootReducer(appScope);
```

This would produce:

```json
{
  "user": {
    "user": {
      "data": null,
      "error": null,
      "loading": false
    },
    "favorites": []
  },
  "preferences": {
    "preferences": {
      "fontSize": "small"
    }
  }
}
```

If you pass a collection of scopes to `createRootReducer`, it will create the root scope (named `root`) for you behind the scenes:

```javascript
const rootReducer = createRootReducer([userScope, preferencesScope]);
```

### Action types are scoped automatically

Nesting scopes automatically prefixes action types with scope names of all the parent scopes. Say, if we dispatch following actions:

```javascript
dispatch(addToFavorites({ userId: 123 }));
dispatch(setFontSize('large'));
dispatch(fetchUser());
```

created actions would have automatically scoped action types:

```
'app/favorites/add-to-favorites'
```

```
'app/user/set-font-size'
```

```
'app/user/fetch-user/request'
'app/user/fetch-user/success'
'app/user/fetch-user/error'
```

### Selectors stay wired correctly

✨ No matter where you import and use your selectors, you always pass the root state, no need to pass the substate selector manually.

✨ The mechanism of nesting scopes using `connectScope` makes sure all selectors remain connected to the right part of the state 🔬

✨ Your modules do not need to know where their reducer will be mounted, thus you get enhanced modularity.

✨ You can use your selectors like any other selector, compose them or use them with [reselect](https://github.com/reduxjs/reselect).

## Interop with other reducers

### Connecting external reducer to Redux scope

Just connect your reducer to a scope:

```javascript
import { reducer } from './external-module';

const externalScope = createReducer('some-external-module');
externalScope.connectReducer(reducer);
```

### Connecting result of `createRootReducer` to external reducer

Provide a path to the mounting point so that selectors can work correctly:

```javascript
// use redux scope as usual
const myRootScope = createScope('my-root-scope');

// provide path to root scope so that selectors can work correctly
const myRootReducer = createRootReducer(
  myRootScope,
  state => state.somewhere.deep,
);

// use like any other reducer
const otherReducer = combineReducers({
  myRootReducer,
  // ... other reducers
});
```
