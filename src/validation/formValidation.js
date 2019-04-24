import _get from 'lodash/get';
import _set from 'lodash/set';
import { unset as _unsetFp } from 'lodash/fp';
import { joinPath, addIndex } from '../utils';

export default (schema, input, basePath) => {
  const errors = {};
  let cleanInput = Object.assign({}, input);

  // eslint-disable-next-line consistent-return
  const validateNode = (node, path) => {
    const setError = (id, message) => _set(errors, joinPath(id, path), message);
    const getInput = id => _get(input, joinPath(id, path));

    if (Array.isArray(node)) {
      return node.map(x => validateNode(x, path));
    }

    if (node.groupId) {
      return node.elements.map(x => validateNode(x, path));
    }

    if (node.showIf && !(getInput(node.showIf.id) === node.showIf.value)) {
      cleanInput = _unsetFp(joinPath(node.id, path), cleanInput);
      return null;
    }

    if (node.elements) {
      const repeaterInput = getInput(node.id);
      if (Array.isArray(repeaterInput)) {
        repeaterInput.map((_x, index) => validateNode(node.elements, joinPath(addIndex(node.id, index), path)));
      }
      return null;
    }

    if (node.validation) {
      if (node.validation.required && !getInput(node.id)) {
        return setError(node.id, 'This field is required');
      }

      if (node.validation.minLength && getInput(node.id).length < node.validation.minLength) {
        return setError(node.id, `Failed to meet minimum length of ${node.validation.minLength} characters`);
      }

      if (node.validation.maxLength && getInput(node.id).length > node.validation.maxLength) {
        return setError(node.id, `Please limit input to ${node.validation.maxLength} characters`);
      }

      if (node.validation.pattern) {
        const regex = new RegExp(node.validation.pattern);
        if (!regex.test(getInput(node.id))) {
          return setError(node.id, `Failed to match regex ${node.validation.pattern}`);
        }
      }
    }
  };

  validateNode(schema, basePath);

  return {
    errors: Object.keys(errors).length > 0 ? errors : null,
    cleanInput,
  };
};
