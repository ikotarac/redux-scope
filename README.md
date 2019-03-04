# Redux Scope 🔭

Remove Redux boilerplate and enhance your project modularity 🚀

Redux scope logically brings together *actions*, *action types*, *reducers* and *selectors*.
It puts the focus on **reducers** and the **state**, sparing you from doing all the internal wiring yourself.


## Installation

`npm install redux-scope`

## Usage


```javascript
import createScope, { createRootReducer } from 'redux-scope';
import { fetchUserDataAsync } from './my-user-api'

const userProfileScope = createScope('user-profile');
const { createAction, connectReducer } = userProfileScope;

// creates a thunk with corresponding request, success and error actions:
const fetchUser = createAction(fetchUserDataAsync, 'fetch-user');

// creates a simple action and its type
const setFontSize = createAction('set-font-size');

const userDefault = {
  user: null,
  loading: false,
  error: null,
};

const user(state = userDefault, action) {
  switch (action.type) {
    case fetchUser.type.request: // actual value: 'user-profile/fetch-user/request'
      return {
        ...state,
        loading: true,
        error: null,
      };
    case fetchUser.type.success: // 'user-profile/fetch-user/success'
      return {
        ...state,
        user: action.payload,
        loading: false,
        error: null,
      };
    case fetchUser.type.error: // 'user-profile/fetch-user/error'
      return {
        ...state,
        loading: false,
        error: action.error,
      };
    default:
      return state; 
  }
}

// when you connect reducer, you get selectors based on the default state shape
const { user, loading, error } = connectReducer(user);

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

const { fontSize } = connectReducer(preferences);

// when you're ready to create your redux store, just get the root reducer
const rootReducer = createRootReducer(userProfileScope);

// const store = createStore(rootReducer, applyMiddleware(thunk));
