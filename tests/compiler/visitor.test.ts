import {visitor} from '../../sources';

import './passes/helpers';

describe(`visitors`, () => {
  describe(`replacer`, () => {
    it(`should support replacing nothing`, () => {
      expect(visitor.build({
      })).toChangeAST(`start = "foo"`, {
        rules: [{
          name: `start`,
          type: `rule`,
          expression: {
            type: `literal`,
            value: `foo`,
          },
        }],
      });
    });

    it(`should support replacing an expression by another`, () => {
      expect(visitor.build({
        literal(visit, node) {
          return {
            type: `literal`,
            value: `bar`,
          };
        },
      })).toChangeAST(`start = "foo"`, {
        rules: [{
          name: `start`,
          type: `rule`,
          expression: {
            type: `literal`,
            value: `bar`,
          },
        }],
      });
    });

    it(`should support removing a node from a sequence`, () => {
      expect(visitor.build({
        literal(visit, node) {
          return node.value === `foo` ? null : node;
        },
      })).toChangeAST(`start = "foo" "bar"`, {
        rules: [{
          name: `start`,
          type: `rule`,
          expression: {
            type: `sequence`,
            elements: [{
              type: `literal`,
              value: `bar`,
            }],
          },
        }],
      });
    });

    it(`should support removing a node from an expression`, () => {
      expect(visitor.build({
        initializer(visit, node) {
          return null;
        },
      })).toChangeAST(`{ console.log(42) }\nstart = "foo" "bar"`, {
        initializer: null,
      });
    });

    it(`should support returning a completely different node than the original`, () => {
      expect(visitor.build({
        action(visit, node) {
          return node.expression;
        },
      })).toChangeAST(`start = "foo" { return 42 }`, {
        rules: [{
          name: `start`,
          type: `rule`,
          expression: {
            type: `literal`,
            value: `foo`,
          },
        }],
      });
    });
  });
});
