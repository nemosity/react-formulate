import { Component, createElement, Fragment } from 'react';
import PropTypes from 'prop-types';
import _get from 'lodash/get';
import { addIndex, joinPath } from '../../utils';

class DynamicForm extends Component {
  render() {
    const {
      schema,
      data,
      onUpdate,
      errors,
      i18n,
      onValidateElement,
      basePath,
      widgets,
      config = {},
    } = this.props;

    const hyrdate = x => Object.keys(x).reduce((acc, curr) => {
      acc[curr] = _get(data, x[curr]);
      return acc;
    }, {});

    const parse = text => (typeof text === 'object' ? i18n(text.text, hyrdate(text.params)) : text);

    const processNode = (node, path) => {
      const p = id => joinPath(id, path);

      if (Array.isArray(node)) {
        return createElement(Fragment, null, ...node.map(x => processNode(x, path)));
      }

      if (node.groupId) {
        return createElement(Fragment, null, createElement('h4', null, parse(node.label)), processNode(node.elements, path));
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
        ...node.properties,
        // standard interface
        id: p(node.id),
        error: _get(errors, p(node.id)),
        value: _get(data, p(node.id), node.defaultValue || ''),
        placeholder: node.placeholder,
        label: parse(node.label),
        onChange: (payload) => {
          onUpdate(p(node.id), payload);
          if (config.inlineValidation && !node.elements && _get(errors, p(node.id))) {
            onValidateElement(node, path);
          }
        },
        onBlur: () => {
          if (config.inlineValidation) {
            onValidateElement(node, path);
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
    return processNode(schema, basePath);
  }
}

function validateExtendedPropsUse(props) {
  let truthyProps = 0;
  if (props.data) {
    truthyProps += 1;
  }
  if (truthyProps && truthyProps !== 5) {
    return new Error('Must provide all props');
  }
  return null;
}

DynamicForm.propTypes = {
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
  data: validateExtendedPropsUse,
  onUpdate: PropTypes.func,
  errors: PropTypes.objectOf(PropTypes.string),
  i18n: PropTypes.func,
  onValidateElement: PropTypes.func,
  basePath: PropTypes.string,
  widgets: PropTypes.objectOf(PropTypes.elementType).isRequired,
  config: PropTypes.shape({
    inlineValidation: PropTypes.bool,
  }),
};

DynamicForm.defaultProps = {
  data: null,
  onUpdate: () => { },
  onValidateElement: () => {},
  i18n: k => k,
  config: {},
  basePath: null,
  errors: {},
};

export default DynamicForm;
