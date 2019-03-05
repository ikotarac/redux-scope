# Redux Scope 🔭

Remove Redux boilerplate and enhance your project modularity.

Redux scope logically brings together _actions_, _action types_, _reducers_ and _selectors_.
It puts the focus on **reducers** and the **state**, making them modular and well organised, sparing you from doing all the internal wiring yourself.

## Installation

`npm install redux-scope`

## Usage

```javascript
import createScope from 'redux-scope';
import { fetchUserDataAsync } from './my-user-api'

export const userProfileScope = createScope('user-profile-scope');
const { createAction, connectReducer } = userProfileScope;

// creates a thunk with corresponding request, success and error actions
export const fetchUser = createAction(fetchUserDataAsync, 'fetch-user');

// creates a simple action creator and its type
export const setFontSize = createAction('set-font-size');

const userDefault = {
  user: null,
  loading: false,
  error: null,
};

const user(state = userDefault, action) {
  switch (action.type) {
    case fetchUser.type.request: // value: 'user-profile-scope/fetch-user/request'
      return {
        ...state,
        loading: true,
        error: null,
      };
    case fetchUser.type.success: // 'user-profile-scope/fetch-user/success'
      return {
        ...state,
        user: action.payload,
        loading: false,
        error: null,
      };
    case fetchUser.type.error: // 'user-profile-scope/fetch-user/error'
      return {
        ...state,
        loading: false,
        error: action.error,
      };
    default:
      return state;
  }
}

// when you connect reducer, you get selectors based on the shape of the default state
export const { user, loading, error } = connectReducer(user);

// you can connect more reducers to a single scope
function preferences(state = { fontSize: 'small' }, action) {
case setFontSize.type.success:
      return {
        ...state,
        fontSize: action.payload,
      };
    default:
      return state;
}

export const { fontSize } = connectReducer(preferences);
```

### Getting root reducer

When you're ready to create your redux store, just use the root scope to get the root reducer

```javascript
import { createRootReducer } from "redux-scope";
import { userProfileScope } from "./user-profile";
// ... //

const rootReducer = createRootReducer(userProfileScope);
const store = createStore(rootReducer, applyMiddleware(thunk));
```

### Remarks

✨ Generated root reducer produces state with the following shape

```javascript
{
  user: {
    user: null,
    error: null,
    loading: false,
  },
  preferences: {
    fontSize: 'small',
  },
}
```

✨ All selectors are wired automagically, they recieve root state and work everywhere

```javascript
loading(state); // false
fontSize(state); // 'small'
```

## Composing scopes

Redux scopes can be nested. Let's make another scope:

```javascript
export const favoritesScope = createScope('favorites-scope');
const { createAction, connectReducer } = favoritesScope;

const addToFavorites = createAction('add-to-favorites');

function favorites(state = [], action) {
  switch(action.type) {
    case addToFavorites.type.success:
    return [...state, action.payload],
    default:
      return state;
  }
}

const getFavorites = connectReducer(favoriteProfiles);
```

Now let's connect `favorites` scope as a child of the `user-profile` scope, and create root reducer.

```javascript
import { createRootReducer } from "redux-scope";
import { userProfileScope } from "./user-profile";
import { favoritesScope } from "./favorites";
...

userProfileScope.connectScope(favoritesScope);

const rootReducer = createRootReducer(userProfileScope);
const store = createStore(rootReducer, applyMiddleware(thunk));
```

Now, generated state looks like this:

```javascript
{
  user: {
    user: { ... },
    error: null,
    loading: false,
  },
  preferences: {
    fontSize: 'small',
  },
  'favorites-scope': {
    favorites: [1, 2, ...],
  },
}
```

✨ All reducers in a child scope are combined together using `combineReducers` before merging with reducers that belong to the parent scope

✨ combined child reducers appear in the part of the state named by the scope they belong to, in this case `favorites-scope`

### Scopes can be nested in any arrangement

If we do the nesting other way around:

`favoritesScope.connectScope(userProfileScope)`

root reducer would produce following state shape:

```
{
  'user-profile-scope': {
    user: {
      user: { ... },
      error: null,
      loading: false,
    },
    preferences: {
      fontSize: 'small',
    },
  }

  favorites: [1, 2, ...],
}
```

Or we can create a new scope just to contain all the child scopes:

```javascript
const appScope = createScope("app-scope");
appScope.connectScope(userProfileScope);
appScope.connectScope(favoritesScope);

const rootReducer = createRootReducer(appScope);
```

which would produce:

```
{
  'user-profile-scope': {
    user: {
      user: { ... },
      error: null,
      loading: false,
    },
    preferences: {
      fontSize: 'small',
    },
  }
  'favorites-scope': {
    favorites: [1, 2, ...],
  }
}
```

If you pass a collection of scopes to `createRootReducer`, it will create the root scope for you behind the scenes:

```
const rootReducer = createRootReducer([
  userProfileScope,
  favoritesScope
]);
```

### Action types are scoped automatically

Nesting scopes automatically prefixes action types with scope names of all the parent scopes. Say, if we dispatch following actions:

```javascript
dispatch(addToFavorites(12345));
dispatch(setFontSize("large"));
```

created actions would have automatically scoped action types:

```
'app-scope/favorites-scope/add-to-favorites/success'
```

```
'app-scope/user-profile-scope/set-font-size/success'
```

### Selectors stay wired correctly

✨ No matter where you import and use your selectors, you always pass the root state, no need to pass the substate selector manually.

✨ The mechanism of nesting scopes using `connectScope` makes sure all selectors remain connected to the right part of the state. Neat! 🔬

✨ Your modules do not need to know where their reducer will be mounted, thus you get enhanced modularity.

✨ You can use your selectors like any other selector, compose them or use them with `reselect`.

## Interop with other reducers

### Connecting external reducer to Redux scope

Just connect your reducer to a scope:

```javascript
import { reducer } from './external-module'

const externalScope = createReducer('some-external-module');
externalScope.connectReducer(reducer);

...
```

### Connecting root reducer produced by `createRootReducer` to external reducer

Provide a path to the mounting point so that selectors can work correctly

```javascript
const myRootScope = createScope('my-root-scope');
...

// provide path to root scope so that selectors can work correctly
const myRootReducer = createRootReducer(myRootScope, state => state.somewhere.deep);

// use like any other reducer
const otherReducer = combineReducers({
  myRootReducer,
...
})
```
