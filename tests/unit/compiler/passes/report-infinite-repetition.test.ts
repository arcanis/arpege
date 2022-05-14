import {compiler} from 'pegjs';

import './helpers';

describe(`compiler pass |reportInfiniteRepetition|`, () => {
  const {reportInfiniteRepetition} = compiler.passes.check;

  it(`reports infinite loops for zero_or_more`, () => {
    expect(reportInfiniteRepetition).toReportError(`start = ("")*`, {
      message: `Possible infinite loop when parsing (repetition used with an expression that may not consume any input).`,
      location: {
        start: {offset: 8, line: 1, column: 9},
        end: {offset: 13, line: 1, column: 14},
      },
    });
  });

  it(`reports infinite loops for one_or_more`, () => {
    expect(reportInfiniteRepetition).toReportError(`start = ("")+`, {
      message: `Possible infinite loop when parsing (repetition used with an expression that may not consume any input).`,
      location: {
        start: {offset: 8, line: 1, column: 9},
        end: {offset: 13, line: 1, column: 14},
      },
    });
  });

  it(`computes expressions that always consume input on success correctly`, () => {
    expect(reportInfiniteRepetition).toReportError(`start = a*\na "a" = ""`);
    expect(reportInfiniteRepetition).not.toReportError(`start = a*\na "a" = "a"`);

    expect(reportInfiniteRepetition).toReportError(`start = ("" / "a" / "b")*`);
    expect(reportInfiniteRepetition).toReportError(`start = ("a" / "" / "b")*`);
    expect(reportInfiniteRepetition).toReportError(`start = ("a" / "b" / "")*`);
    expect(reportInfiniteRepetition).not.toReportError(`start = ("a" / "b" / "c")*`);

    expect(reportInfiniteRepetition).toReportError(`start = ("" { })*`);
    expect(reportInfiniteRepetition).not.toReportError(`start = ("a" { })*`);

    expect(reportInfiniteRepetition).toReportError(`start = ("" "" "")*`);
    expect(reportInfiniteRepetition).not.toReportError(`start = ("a" "" "")*`);
    expect(reportInfiniteRepetition).not.toReportError(`start = ("" "a" "")*`);
    expect(reportInfiniteRepetition).not.toReportError(`start = ("" "" "a")*`);

    expect(reportInfiniteRepetition).toReportError(`start = (a:"")*`);
    expect(reportInfiniteRepetition).not.toReportError(`start = (a:"a")*`);

    expect(reportInfiniteRepetition).toReportError(`start = ($"")*`);
    expect(reportInfiniteRepetition).not.toReportError(`start = ($"a")*`);

    expect(reportInfiniteRepetition).toReportError(`start = (&"")*`);
    expect(reportInfiniteRepetition).toReportError(`start = (&"a")*`);

    expect(reportInfiniteRepetition).toReportError(`start = (!"")*`);
    expect(reportInfiniteRepetition).toReportError(`start = (!"a")*`);

    expect(reportInfiniteRepetition).toReportError(`start = (""?)*`);
    expect(reportInfiniteRepetition).toReportError(`start = ("a"?)*`);

    expect(reportInfiniteRepetition).toReportError(`start = (""*)*`);
    expect(reportInfiniteRepetition).toReportError(`start = ("a"*)*`);

    expect(reportInfiniteRepetition).toReportError(`start = (""+)*`);
    expect(reportInfiniteRepetition).not.toReportError(`start = ("a"+)*`);

    expect(reportInfiniteRepetition).toReportError(`start = ("")*`);
    expect(reportInfiniteRepetition).not.toReportError(`start = ("a")*`);

    expect(reportInfiniteRepetition).toReportError(`start = (&{ })*`);

    expect(reportInfiniteRepetition).toReportError(`start = (!{ })*`);

    expect(reportInfiniteRepetition).toReportError(`start = a*\na = ""`);
    expect(reportInfiniteRepetition).not.toReportError(`start = a*\na = "a"`);

    expect(reportInfiniteRepetition).toReportError(`start = ""*`);
    expect(reportInfiniteRepetition).not.toReportError(`start = "a"*`);

    expect(reportInfiniteRepetition).not.toReportError(`start = [a-d]*`);

    expect(reportInfiniteRepetition).not.toReportError(`start = .*`);
  });
});
