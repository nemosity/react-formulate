import {
  flow as _flowFp,
  set as _setFp,
  unset as _unsetFp,
  merge as _mergeFp,
} from 'lodash/fp';

const reducer = (state, { type, payload }) => {
  switch (type) {
    case 'FORM_RESET': {
      return {
        ...payload,
      };
    }

    case 'UPDATE_INPUT': {
      const [data, path] = payload;
      return _flowFp(
        _setFp(`data.${path}`, data),
      )(state);
    }

    case 'UPDATE_INPUT_AND_VALIDATE_ELEMENT': {
      const [data, path, node] = payload;
      return _flowFp(
        _setFp(`data.${path}`, data),
        _setFp('validateNode', [node, path]),
      )(state);
    }

    case 'VALIDATE_FORM': {
      return _flowFp(
        _setFp('validateForm', true),
      )(state);
    }

    case 'VALIDATE_FORM_FAIL': {
      return {
        ...state,
        validateForm: false,
        errors: payload,
      };
    }

    case 'VALIDATE_FORM_SUCCESS': {
      return _flowFp(
        _setFp('data', payload),
        _setFp('errors', null),
        _setFp('validateForm', false),
        _setFp('formComplete', true),
      )(state);
    }

    case 'VALIDATE_ELEMENT': {
      const [node, path] = payload;
      return _flowFp(
        _setFp('validateNode', [node, path]),
      )(state);
    }

    case 'VALIDATE_ELEMENT_FAIL': {
      return {
        ...state,
        validateNode: null,
        errors: _mergeFp(state.errors, payload),
      };
    }

    case 'VALIDATE_ELEMENT_SUCCESS': {
      return _flowFp(
        _unsetFp(`errors.${payload}`),
        _setFp('validateNode', null),
      )(state);
    }

    default:
      return state;
  }
};

export default reducer;
