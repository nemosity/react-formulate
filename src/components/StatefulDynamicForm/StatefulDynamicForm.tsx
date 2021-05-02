import * as React from 'react';
import { createElement, FunctionComponent, useEffect, useReducer } from 'react';
import * as PropTypes from 'prop-types';

import reducer, { TState } from './reducer';

import validate from '../../validation/formValidation';
import DynamicForm from '../DynamicForm/DynamicForm';
import { joinPath } from '../../utils';

const initialState: TState = {
  errors: null,
  validateForm: false,
  validateNode: null,
  formComplete: false,
  data: {},
};

const StatefulDynamicForm: FunctionComponent<any> = (props) => {
  const { schema, onSubmit, i18n, widgets, config = {} } = props;

  const [state, dispatch] = useReducer(reducer, initialState);

  const { data, validateForm, validateNode, errors } = state;

  const onUpdate = (path, input) =>
    dispatch({ type: 'UPDATE_INPUT', payload: [input, path] });

  const onValidateElement = (node, path) => {
    dispatch({ type: 'VALIDATE_ELEMENT', payload: [node, path] });
  };

  useEffect(() => {
    if (validateForm) {
      const output = validate(schema, data, null);
      if (output.errors) {
        dispatch({ type: 'VALIDATE_FORM_FAIL', payload: output.errors });
      } else {
        dispatch({ type: 'VALIDATE_FORM_SUCCESS', payload: output.cleanInput });
        onSubmit(output.cleanInput);
      }
    }
  }, [data, onSubmit, schema, validateForm]);

  useEffect(() => {
    if (validateNode) {
      const [node, path] = validateNode;
      const output = validate(node, data, path);
      if (output.errors) {
        dispatch({ type: 'VALIDATE_ELEMENT_FAIL', payload: output.errors });
      } else {
        dispatch({
          type: 'VALIDATE_ELEMENT_SUCCESS',
          payload: joinPath(node.id, path),
        });
      }
    }
  }, [data, validateNode]);

  return (
    <>
      {
        <DynamicForm
          schema={schema}
          data={data}
          onUpdate={onUpdate}
          errors={errors}
          i18n={i18n}
          onValidateElement={onValidateElement}
          widgets={widgets}
          config={config}
        />
      }
      {createElement(widgets.Button, {
        onClick: () => {
          dispatch({ type: 'VALIDATE_FORM' });
        },
        label: 'Submit',
      })}
    </>
  );
};

StatefulDynamicForm.propTypes = {
  schema: PropTypes.oneOfType([
    PropTypes.shape({ id: PropTypes.string }),
    PropTypes.shape({ groupId: PropTypes.string }),
    PropTypes.shape({ id: PropTypes.string }),
    PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.shape({ id: PropTypes.string }),
        PropTypes.shape({ groupId: PropTypes.string }),
        PropTypes.shape({ id: PropTypes.string }),
      ]).isRequired,
    ),
  ]).isRequired,
  onSubmit: PropTypes.func.isRequired,
  i18n: PropTypes.func,
  widgets: PropTypes.objectOf(PropTypes.elementType).isRequired,
  config: PropTypes.shape({
    inlineValidation: PropTypes.bool,
  }),
};

StatefulDynamicForm.defaultProps = {
  i18n: (k) => k,
  config: {},
};

export default StatefulDynamicForm;
