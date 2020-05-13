## @nemosity/react-formulate

Weclome to react-formulate!

An extensible React library for building dynamic declarative forms.

---

__NB: Please note react-formulate is currently in alpha and breaking changes can be expected__

This library can be used to quickly integrate dynamic forms into your ReactJS or React Native application.

Features:
- custom validation
- conditonal elements
- pagination
- 3rd party state management support

### Getting started

An example playground can be viewed at https://nemosity.github.io/react-formulate-demo/

![](react-formulate-demo.gif)

The following code snippet outlines provides

```
import { StatefulDynamicForm, BaseWidgets } from '@nemosity/react-formulate';

schema = [
  {
    id: 'size',
    widget: 'Radio',
    values: [
      {
        label: 'S (4oz)',
        value: 'small',
      },
      {
        label: 'M (6oz)',
        value: 'medium',
      },
      {
        label: 'L (8oz)',
        value: 'large',
      },
    ],
    label: 'Size',
  },
  {
    id: 'strength',
    widget: 'Radio',
    values: [
      {
        label: 'Single',
        value: 'single',
      },
      {
        label: 'Double',
        value: 'double',
      },
    ],
    label: 'Strength',
  },
  {
    id: 'notes',
    widget: 'Input',
    placeholder: 'E.g. extra hot',
    label: 'Note',
  },
];

const Form = () => (
  <StatefulDynamicForm
    widgets={BaseWidgets}
    schema={schema}
    onSubmit={(data) => {console.log('Form submitted!', data)}}
  />
);

export default Form;
```

### Publishing

To release:

- `npm run prerelease`
- `git push --tags`

Then login to Gitub and create a release to kickstart the release pipeline
