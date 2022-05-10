import {compiler} from 'arpege';

import './helpers';

describe(`compiler pass |reportUndefinedRules|`, () => {
  const {reportUndefinedRules} = compiler.passes.check;

  it(`reports undefined rules`, () => {
    expect(reportUndefinedRules).toReportError(`start = undefined`, {
      message: `Rule "undefined" is not defined.`,
      location: {
        start: {offset: 8, line: 1, column: 9},
        end: {offset: 17, line: 1, column: 18},
      },
    });
  });
});
