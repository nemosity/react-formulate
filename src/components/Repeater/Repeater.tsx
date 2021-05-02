import * as React from 'react';
import { createElement, FunctionComponent, useEffect } from 'react';
import * as PropTypes from 'prop-types';
import { pullAt as _pullAt } from 'lodash/fp';
import { fill as _fill } from 'lodash';
import { addIndex } from '../../utils';

const elementsPropTypes = PropTypes.oneOfType([
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
]);

const propTypes = {
  value: PropTypes.arrayOf(PropTypes.object),
  minRepeats: PropTypes.number,
  maxRepeats: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  button: PropTypes.elementType.isRequired,
  path: PropTypes.string.isRequired,
  processNode: PropTypes.func.isRequired,
  elements: elementsPropTypes.isRequired,
};

type RepeaterProps = PropTypes.InferProps<typeof propTypes>;

const addItem = (props: RepeaterProps) => {
  const { onChange, value } = props;
  onChange([...(Array.isArray(value) ? value : []), {}]);
};

const canAddItem = (props: RepeaterProps) => {
  const { maxRepeats, value } = props;
  return maxRepeats && Array.isArray(value) && value.length >= maxRepeats;
};

const canRemoveItem = (props: RepeaterProps) => {
  const { minRepeats, value } = props;
  return !!(minRepeats && Array.isArray(value) && value.length <= minRepeats);
};

const removeItem = (props: RepeaterProps, index: number) => {
  const { onChange, value } = props;
  onChange(_pullAt(index, value as []));
};

const Repeater: FunctionComponent<RepeaterProps> = (props: RepeaterProps) => {
  useEffect(() => {
    const { value, minRepeats, onChange } = props;
    if (!Array.isArray(value) && minRepeats) {
      onChange(_fill(Array(minRepeats), {}));
    }
  }, []);

  const { value, name, label, button, path, processNode, elements } = props;
  return (
    <div>
      <label className="dynamic-form__label">{label}</label>
      <div className="repeater-group">
        {Array.isArray(value)
          ? value.map((_, i) => (
              <div key={i} className="repeater-item">
                <span className="remove">
                  {createElement(button, {
                    onClick: () => removeItem(props, i),
                    disabled: canRemoveItem(props),
                    label: 'Remove',
                    className: 'dynamic-form__remove',
                  })}
                </span>
                <h3>{`${name} ${i + 1}`}</h3>
                {processNode(elements, addIndex(path, i))}
              </div>
            ))
          : null}
        {createElement(button, {
          onClick: () => addItem(props),
          disabled: canAddItem(props),
          label: `Add ${name}`,
          className: 'dynamic-form__add',
        })}
      </div>
    </div>
  );
};

Repeater.defaultProps = {
  value: [],
  minRepeats: 0,
};

export default Repeater;
