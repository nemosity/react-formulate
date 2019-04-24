import React, { Component, createElement } from 'react';
import PropTypes from 'prop-types';
import { pullAt as _pullAt } from 'lodash/fp';
import _fill from 'lodash/fill';
import { addIndex } from '../../utils';

class Repeater extends Component {
  constructor() {
    super();
    this.addItem = this.addItem.bind(this);
    this.canRemoveItem = this.canRemoveItem.bind(this);
    this.canAddItem = this.canAddItem.bind(this);
  }

  componentDidMount() {
    const { value, minRepeats, onChange } = this.props;
    if (!Array.isArray(value) && minRepeats) {
      onChange(_fill(Array(minRepeats), {}));
    }
  }

  addItem() {
    const { onChange, value } = this.props;
    onChange([
      ...(Array.isArray(value) ? value : []),
      {},
    ]);
  }

  canAddItem() {
    const { maxRepeats, value } = this.props;
    return maxRepeats && Array.isArray(value) && (value.length >= maxRepeats);
  }

  canRemoveItem() {
    const { minRepeats, value } = this.props;
    return !!(minRepeats && Array.isArray(value) && (value.length <= minRepeats));
  }

  removeItem(index) {
    const { onChange, value } = this.props;
    onChange(_pullAt(index, value));
  }

  renderItems() {
    const {
      value,
      name,
      button,
      path,
      processNode,
      elements,
    } = this.props;
    if (Array.isArray(value)) {
      return value.map((item, i) => (
        <div key={i} className="repeater-item">
          <span className="remove">
            {createElement(button, {
              onClick: () => this.removeItem(i),
              disabled: this.canRemoveItem(),
              label: 'Remove',
              className: 'dynamic-form__remove',
            })}
          </span>
          <h3>{`${name} ${i + 1}`}</h3>
          {processNode(elements, addIndex(path, i))}
        </div>
      ));
    }
    return null;
  }

  render() {
    const { button, label, name } = this.props;
    return (
      <div>
        <label className="dynamic-form__label">{label}</label>
        <div className="repeater-group">
          {this.renderItems()}
          {createElement(button, {
            onClick: this.addItem,
            disabled: this.canAddItem(),
            label: `Add ${name}`,
            className: 'dynamic-form__add',
          })}
        </div>
      </div>
    );
  }
}

Repeater.propTypes = {
  value: PropTypes.arrayOf(PropTypes.object),
  minRepeats: PropTypes.number,
  maxRepeats: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  button: PropTypes.elementType.isRequired,
  path: PropTypes.string.isRequired,
  processNode: PropTypes.func.isRequired,
  elements: PropTypes.oneOfType([
    PropTypes.shape({ id: PropTypes.string }),
    PropTypes.shape({ groupId: PropTypes.string }),
    PropTypes.shape({ id: PropTypes.string }),
    PropTypes.arrayOf(PropTypes.oneOfType([
      PropTypes.shape({ id: PropTypes.string }),
      PropTypes.shape({ groupId: PropTypes.string }),
      PropTypes.shape({ id: PropTypes.string }),
    ]).isRequired),
  ]).isRequired,
};

Repeater.defaultProps = {
  value: '',
  minRepeats: 0,
};

export default Repeater;
