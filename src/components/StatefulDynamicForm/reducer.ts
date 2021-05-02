import { flow as _flowFp, set as _setFp, merge as _mergeFp } from 'lodash/fp';

type TAction =
  | { type: 'FORM_RESET'; payload: TState }
  | { type: 'UPDATE_INPUT'; payload: [any, string] }
  | {
      type: 'UPDATE_INPUT_AND_VALIDATE_ELEMENT';
      payload: [any, string, string];
    }
  | { type: 'VALIDATE_FORM' }
  | { type: 'VALIDATE_FORM_FAIL'; payload: Record<string, string> }
  | { type: 'VALIDATE_FORM_SUCCESS'; payload: any }
  | { type: 'VALIDATE_ELEMENT'; payload: [any, string] }
  | { type: 'VALIDATE_ELEMENT_FAIL'; payload: Record<string, string> }
  | { type: 'VALIDATE_ELEMENT_SUCCESS'; payload: string };

export type TState = {
  data: any;
  errors: Record<string, string | undefined> | null;
  validateForm: boolean;
  validateNode: [any, string] | null;
  formComplete: boolean;
};

const reducer = (state: TState, action: TAction): TState => {
  switch (action.type) {
    case 'FORM_RESET': {
      return action.payload;
    }

    case 'UPDATE_INPUT': {
      const [data, path] = action.payload;
      return _flowFp(_setFp(`data.${path}`, data))(state);
    }

    case 'UPDATE_INPUT_AND_VALIDATE_ELEMENT': {
      const [data, path, node] = action.payload;
      return {
        ...state,
        data: {
          ...state.data,
          [path]: data,
        },
        validateNode: [node, path],
      };
    }

    case 'VALIDATE_FORM': {
      return _flowFp(_setFp('validateForm', true))(state);
    }

    case 'VALIDATE_FORM_FAIL': {
      return {
        ...state,
        validateForm: false,
        errors: action.payload,
      };
    }

    case 'VALIDATE_FORM_SUCCESS': {
      return {
        ...state,
        data: action.payload,
        errors: null,
        validateForm: false,
        formComplete: true,
      };
    }

    case 'VALIDATE_ELEMENT': {
      const [node, path] = action.payload;
      return _flowFp(_setFp('validateNode', [node, path]))(state);
    }

    case 'VALIDATE_ELEMENT_FAIL': {
      return {
        ...state,
        validateNode: null,
        errors: _mergeFp(state.errors, action.payload),
      };
    }

    case 'VALIDATE_ELEMENT_SUCCESS': {
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload]: undefined,
        },
        validateNode: null,
      };
    }

    default:
      return state;
  }
};

export default reducer;
