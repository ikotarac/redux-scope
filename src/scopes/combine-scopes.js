import _ from 'lodash';

export function combineScopes(groupName, children) {
  if (!groupName) {
    throw new Error('No name provided for combined scope.');
  }

  if (_.isEmpty(children)) {
    throw new Error('No children provided for combined scope.');
  }

  return {
    name: groupName,
    children,
  };
}
