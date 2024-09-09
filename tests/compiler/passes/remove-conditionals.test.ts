import {compiler} from 'arpege';

import './helpers';

describe(`compiler pass |removeConditionals|`, () => {
  const {removeConditionals} = compiler.passes.transform;

  it(`remove conditional expressions in choices`, () => {
    expect(removeConditionals).toChangeAST(`start = "foo" / @if(bar) "bar"`, {
      rules: [{
        name: `start`,
        type: `rule`,
        expression: {
          type: `choice`,
          alternatives: [{
            type: `literal`,
            value: `foo`,
          }],
        },
      }],
    }, {
      allowedStartRules: [`start`],
    });
  });

  it(`shouldn't remove conditionals with a passing condition`, () => {
    expect(removeConditionals).toChangeAST(`start = "foo" / @if(bar) "bar"`, {
      rules: [{
        name: `start`,
        type: `rule`,
        expression: {
          type: `choice`,
          alternatives: [{
            type: `literal`,
            value: `foo`,
          }, {
            type: `literal`,
            value: `bar`,
          }],
        },
      }],
    }, {
      allowedStartRules: [`start`],
      parameters: new Set([`bar`]),
    });
  });
});
