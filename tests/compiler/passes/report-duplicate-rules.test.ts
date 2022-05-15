import {compiler} from 'arpege';

import './helpers';

describe(`compiler pass |reportDuplicateRules|`, () => {
  const {reportDuplicateRules} = compiler.passes.check;

  it(`reports duplicate rules`, () => {
    expect(reportDuplicateRules).toReportError(`start = "a"\nstart = "b"`, {
      message: `Rule "start" is already defined at line 1, column 1.`,
      location: {
        start: {offset: 12, line: 2, column: 1},
        end: {offset: 23, line: 2, column: 12},
      },
    });
  });
});
