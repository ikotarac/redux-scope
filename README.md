# Redux Scope 🔭

Reduce Redux boilerplate and improve modularity.

Redux Scope logically brings together _actions_, _action types_, _reducers_ and _selectors_ by associating it with a _redux scope_.
It provides helpers for creating actions and selectors which take care of creating unique action types and keep selectors wired correctly as you refactor your modules.

![npm version](https://img.shields.io/npm/v/redux-scope.svg)
![npm downloads](https://img.shields.io/npm/dw/redux-scope.svg)

## Installation

`npm install redux-scope`

## Usage

Most of the apps are written as a collection of modules where each module has its own redux logic. Let's say we are writing a module taking care of user preferences, called `preferences`:

`src/modules/preferences/redux.js`

```javascript
import { createScope, createAction, createSelector } from 'redux-scope';

export const setFontSize = createAction('set-font-size');

function reducer(state = { fontSize: 'small' }, action) {
  switch (action.type) {
    case setFontSize.type:
      return {
        ...state,
        fontSize: action.payload,
      };
    default:
      return state;
  }
}

export const fontSizeSelector = createSelector(state => state.fontSize);

export const preferencesScope = createScope('preferences', reducer, {
  setFontSize,
  fontSizeSelector,
});
```

`src/app.js`

```javascript
import { createStore } from 'redux';
import thunk from 'redux-thunk';
import { createRootReducer } from 'redux-scope';
import {
  preferencesScope,
  setFontSize,
  fontSizeSelector,
} from 'src/modules/preferences';

const rootReducer = createRootReducer({
  preferencesScope,
  // other scopes go here
});

const store = createStore(rootReducer, applyMiddleware(thunk));

// use redux as usual
store.dispatch(setFontSize('big'));
const fontSize = fontSizeSelector(store.getState()); // 'big'
```

## Redux Scope Lifecycle

Usually, Redux lifecycle can be separated into several phases:

1. all reducers are imported from their modules and combined together into a root reducer using `combineReducers`,
2. init action is fired to produce initial state,
3. store is ready for dispatching actions and reading from state.

But before that, in order for modules to cooperate well:

- action types are predefined and prefixed with module paths (or other unique identifier),
- every selector is defined to point to a correct place in resulting global state.

Redux Scope uses this separation between composing redux logic from different modules (Step 1) and actually using that logic (Step 3) to lazy evaluate action types and correct paths for selectors, so that you don't need to hardcode them inside modules.

Here is how Redux lifecycle looks with Redux Scope:

1. actions, selectors and reducer are added to a scope using `createScope`
2. all scopes are imported from their modules and combined together using `combineScopes`
3. root reducer is produced from scopes using `createRootReducer`, which also initializes all action types and selectors to correct values
4. init action is fired to produce initial state
5. store is ready for dispatching actions and reading from state

You don't have to think about action types, they will be prefixed automatically. When you write selectors with `createSelector` you only write how to select a property inside that module (`state => state.fontSize`), Redux Scope takes care of the rest.

## Creating Thunks

`src/modules/user/redux.js`

```javascript
import { createThunk, createScope } from 'redux-scope';
import { fetchUserDataAsync } from './my-user-api';

export const fetchUser = createThunk(fetchUserDataAsync, 'fetch-user');

const initialState = {
  data: null,
  loading: false,
  error: null,
};

function reducer(state = initialState, action) {
  switch (action.type) {
    case fetchUser.type.request:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case fetchUser.type.success:
      return {
        ...state,
        data: action.payload,
        loading: false,
        error: null,
      };
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

export const userProfileScope = createScope('user', reducer, { fetchUser });
```

Let's say `fetchUserDataAsync` looks like this:

```javascript
function fetchUserDataAsync(userId, extraParam) {
  return UserApi.getUser(id, extraParam);
}
```

`fetchUser` thunk will dispatch 2 actions: `request`, and `success` or `error`, that will look like this:

```javascript
dispatch(fetchUser('id-123', true));

const requestAction = {
  type: 'user/fetch-user/request',
  request: ['id-123', true],
};

const successAction = {
  type: 'user/fetch-user/success',
  request: ['id-123', true],
  payload: {
    /* result of api call */
  },
};

const errorAction = {
  type: 'user/fetch-user/error',
  request: ['id-123', true],
  error: {
    /* caught error */
  },
};
```

## Composing Scopes

Redux scopes can be composed using `combineScopes`, analogous to how reducers can be composed using _combineReducers_.

We have already created two modules/scopes named `user` and `preferences`. Now, let's create a third module named `favorites` to illustrate how scope composition works.

`src/modules/favorites/redux.js`

```javascript
import { createScope, createAction, createSelector } from 'redux-scope';

export const addToFavorites = createAction('add-to-favorites');

function reducer(state = [], action) {
  switch(action.type) {
    case addToFavorites.type:
      return [...state, action.payload],
    default:
      return state;
  }
}

export const getFavorites = createSelector(); // by default you select state => state
export const favoritesScope = createScope('favorites', reducer, {
  addToFavorites,
  getFavorites,
});

```

Say we want to combine together `favorites` and `preferences` to form a new module named `user-stuff`:

`src/modules/user-stuff/redux.js`

```javascript
import { combineScopes } from 'redux-scope';
import { preferencesScope } from 'src/modules/preferences';
import { favoritesScope } from 'src/modules/favorites';

export userStuffScope = combineScopes('user-stuff', { preferencesScope, favoritesScope })
```

Now, at the top level:

`src/app.js`

```javascript
import { createStore } from 'redux';
import thunk from 'redux-thunk';
import { createRootReducer } from 'redux-scope';
import { userScope } from 'src/modules/user';
import { userStuffScope } from 'src/modules/user-stuff';

const rootReducer = createRootReducer({
  userScope,
  userStuffScope,
});

const store = createStore(rootReducer, applyMiddleware(thunk));
```

## Features

### Shape of the resulting state

✨ Generated root reducer from the last example produces state with the following shape:

```json
{
  "user": {
    "data": null,
    "error": null,
    "loading": false
  },
  "user-stuff": {
    "preferences": {
      "fontSize": "small"
    },
    "favorites": []
  }
}
```

### Action types are scoped automatically

Composing scopes automatically prefixes action types with scope names of all the parent scopes. Say, if we dispatch following actions:

```javascript
dispatch(addToFavorites({ userId: 'id-123' }));
dispatch(setFontSize('large'));
dispatch(fetchUser('id-123', true));
```

created actions would have automatically scoped action types:

```
'user-stuff/favorites/add-to-favorites'
```

```
'user-stuff/preferences/set-font-size'
```

```
'user/fetch-user/request'
'user/fetch-user/success'
'user/fetch-user/error'
```

### Selectors stay wired correctly

✨ All selectors are wired automatically, they recieve root state and work everywhere:

```javascript
loading(state); // false
fontSize(state); // 'small'
```

✨ No matter where you import and use your selectors, you always pass the root state, no need to pass the substate selector manually.

✨ The mechanism of nesting scopes using `composeScopes` makes sure all selectors remain connected to the right part of the state 🔬

✨ Your modules do not need to know where their reducer will be mounted, thus you get enhanced modularity.

✨ You can use your selectors like any other selector, compose them or use them with [reselect](https://github.com/reduxjs/reselect).

## Interop with plain Redux

### Connecting external reducer to Redux scope

```javascript
import { createScope } from 'redux-scope';
import { reducer } from 'src/modules/external-module';

export const externalScope = createScope('some-external-module', reducer);
```

### Exporting reducer to use with plain Redux

Provide a path to the mounting point so that selectors can work correctly:

`src/modules/module-that-uses-redux-scope/index.js`

```javascript
import { createRootReducer } from 'redux-scope';
import { userScope } from 'src/modules/user';
import { userStuffScope } from 'src/modules/user-stuff';

export const reducer = createRootReducer(
  {
    userScope,
    userStuffScope,
  },
  state => state.pathToThisModule,
);
```

Now you can use exported reducer like any other reducer, compose it with _combineReducers_, and all actions and selectors inside your module will work correctly.
