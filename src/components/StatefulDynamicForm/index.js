import React, {
  createElement,
  Fragment,
  useEffect,
  useReducer,
} from 'react';
import PropTypes from 'prop-types';
import _get from 'lodash/get';

import { addIndex, joinPath } from '../../utils';

import reducer from './reducer';

import validate from '../../validation/formValidation';

const initialState = {
  errors: null,
  validateForm: false,
  validateNode: null,
  formComplete: false,
  data: {},
};

const StatefulDynamicForm = (props) => {
  const {
    schema,
    onUpdate,
    onSubmit,
    i18n,
    basePath,
    widgets,
    config = {},
  } = props;

  const [state, dispatch] = useReducer(reducer, initialState);

  const {
    data,
    validateForm,
    validateNode,
    errors,
  } = state;

  useEffect(() => {
    if (validateForm) {
      const output = validate(schema, data);
      if (output.errors) {
        dispatch({ type: 'VALIDATE_FORM_FAIL', payload: output.errors });
      } else {
        dispatch({ type: 'VALIDATE_FORM_SUCCESS', payload: output.cleanInput });
        onSubmit(output.cleanInput);
      }
    }
  }, [validateForm]);

  useEffect(() => {
    if (validateNode) {
      const [node, path] = validateNode;
      const output = validate(node, data);
      if (output.errors) {
        dispatch({ type: 'VALIDATE_ELEMENT_FAIL', payload: output.errors });
      } else {
        dispatch({ type: 'VALIDATE_ELEMENT_SUCCESS', payload: path });
      }
    }
  }, [validateNode]);

  const hyrdate = (x) => {
    Object.keys(x).reduce((acc, curr) => {
      acc[curr] = _get(data, x[curr]);
      return acc;
    }, {});
  };

  const parse = text => (typeof text === 'object' ? i18n(text.text, hyrdate(text.params)) : text);

  const processNode = (node, path) => {
    const p = id => joinPath(id, path);

    if (Array.isArray(node)) {
      return createElement(Fragment, null, ...node.map(x => processNode(x, path)));
    }

    if (node.groupId) {
      return createElement(Fragment, null, createElement('h4', null, node.label), processNode(node.elements, path));
    }

    if (node.widget === 'Repeater') {
      if (!node.showIf || _get(data, p(node.showIf.id)) === node.showIf.value) {
        return createElement(widgets[node.widget], {
          ...node.properties,
          // standard interface
          id: p(node.id),
          error: _get(errors, p(node.id)),
          value: _get(data, p(node.id), node.defaultValue || ''),
          placeholder: node.placeholder,
          label: parse(node.label),
          onChange: payload => onUpdate(p(node.id), payload),
          // arrays
          elements: node.elements,
          path: p(node.id),
          processNode,
          button: widgets.Button,
        });
      }
      return null;
    }

    return widgets[node.widget] && (!node.showIf || _get(data, p(node.showIf.id)) === node.showIf.value) ? createElement(widgets[node.widget], {
      // custom schema properties
      ...node.properties,
      // standard interface
      id: p(node.id),
      error: _get(errors, p(node.id)),
      value: _get(data, p(node.id), node.defaultValue || ''),
      placeholder: node.placeholder,
      label: parse(node.label),
      onChange: (payload) => {
        // onUpdate(p(node.id), payload);
        // if (config.inlineValidation && !node.elements && _get(errors, p(node.id))) {
        //   onValidateElement(node, path);
        // }
        if (config.inlineValidation && !node.elements && _get(errors, p(node.id))) {
          dispatch({ type: 'UPDATE_INPUT_AND_VALIDATE_ELEMENT', payload: [payload, p(node.id), node] });
        } else {
          dispatch({ type: 'UPDATE_INPUT', payload: [payload, p(node.id)] });
        }
      },
      onBlur: () => {
        if (config.inlineValidation) {
          // onValidateElement(node, path);
          dispatch({ type: 'VALIDATE_ELEMENT', payload: [node, path] });
        }
      },
      // enums
      values: node.values && node.values.reduce((arr, x) => {
        if (x.ref) {
          const refData = _get(data, x.ref);
          if (Array.isArray(refData)) {
            refData.map((y, i) => _get(y, x.label) && arr.push({
              label: _get(y, x.label),
              value: addIndex(x.ref, i),
            }));
          } else if (_get(refData, x.value)) {
            arr.push({
              label: _get(refData, x.label),
              value: _get(refData, x.value),
            });
          }
        } else {
          arr.push(x);
        }
        return arr;
      }, []),
    }) : null;
  };
  return (
    <Fragment>
      {processNode(schema, basePath)}
      {createElement(widgets.Button, {
        onClick: () => {
          dispatch({ type: 'VALIDATE_FORM' });
        },
        label: 'Submit',
      })}
    </Fragment>
  );
};

StatefulDynamicForm.propTypes = {
  schema: PropTypes.oneOfType([
    PropTypes.shape({ id: PropTypes.string }),
    PropTypes.shape({ groupId: PropTypes.string }),
    PropTypes.shape({ id: PropTypes.string }),
    PropTypes.arrayOf(PropTypes.oneOfType([
      PropTypes.shape({ id: PropTypes.string }),
      PropTypes.shape({ groupId: PropTypes.string }),
      PropTypes.shape({ id: PropTypes.string }),
    ]).isRequired),
  ]).isRequired,
  data: PropTypes.oneOfType([
    PropTypes.objectOf(PropTypes.string),
  ]).isRequired,
  onUpdate: PropTypes.func,
  onSubmit: PropTypes.func.isRequired,
  errors: PropTypes.objectOf(PropTypes.string),
  i18n: PropTypes.func,
  onValidateElement: PropTypes.func,
  basePath: PropTypes.string,
  widgets: PropTypes.objectOf(PropTypes.elementType).isRequired,
  config: PropTypes.shape({
    inlineValidation: PropTypes.bool,
  }),
};

StatefulDynamicForm.defaultProps = {
  onUpdate: () => { },
  onValidateElement: () => { },
  i18n: k => k,
  config: {},
  basePath: null,
  errors: {},
};

export default StatefulDynamicForm;
