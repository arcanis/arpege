import * as asts           from '../asts';
import {CompileAnnotation} from '..';

const makeOptional = (expression: asts.Expression): asts.Expression => ({
  type: `action`,
  code: `return value ?? []`,
  expression: {
    type: `labeled`,
    label: `value`,
    expression: {
      type: `optional`,
      expression,
      location: expression.location,
    },
    location: expression.location,
  },
  location: expression.location,
});

const makeSeparatedList = (location: asts.Location | undefined, item: asts.Expression, separator: asts.Expression): asts.Expression => ({
  type: `action`,
  code: `return [head, ...tail]`,
  expression: {
    type: `sequence`,
    elements: [{
      type: `labeled`,
      label: `head`,
      expression: {
        ...item,
      },
      location,
    }, {
      type: `labeled`,
      label: `tail`,
      expression: {
        type: `zeroOrMore`,
        expression: {
          type: `action`,
          code: `return value`,
          expression: {
            type: `sequence`,
            elements: [{
              ...separator,
            }, {
              type: `labeled`,
              label: `value`,
              expression: {
                ...item,
              },
              location,
            }],
            location,
          },
          location,
        },
        location,
      },
      location,
    }],
    location,
  },
  location,
});

export const applySeparator: CompileAnnotation = (ast, node, parameters, options) => {
  if (node.type === `oneOrMore`)
    return makeSeparatedList(node.location, node.expression, parameters.expr);

  if (node.type === `zeroOrMore`)
    return makeOptional(makeSeparatedList(node.location, node.expression, parameters.expr));

  return node;
};
