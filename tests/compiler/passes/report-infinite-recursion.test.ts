import {compiler} from 'arpege';

import './helpers';

describe(`compiler pass |reportInfiniteRecursion|`, () => {
  const {reportInfiniteRecursion} = compiler.passes.check;

  it(`reports direct left recursion`, () => {
    expect(reportInfiniteRecursion).toReportError(`start = start`, {
      message: `Possible infinite loop when parsing (left recursion: start -> start).`,
      location: {
        start: {offset: 8, line: 1, column: 9},
        end: {offset: 13, line: 1, column: 14},
      },
    });
  });

  it(`reports indirect left recursion`, () => {
    expect(reportInfiniteRecursion).toReportError([
      `start = stop`,
      `stop  = start`,
    ].join(`\n`), {
      message: `Possible infinite loop when parsing (left recursion: start -> stop -> start).`,
      location: {
        start: {offset: 21, line: 2, column: 9},
        end: {offset: 26, line: 2, column: 14},
      },
    });
  });

  describe(`in sequences`, () => {
    it(`reports left recursion if all preceding elements match empty string`, () => {
      expect(reportInfiniteRecursion).toReportError(`start = "" "" "" start`);
    });

    it(`doesn't report left recursion if some preceding element doesn't match empty string`, () => {
      expect(reportInfiniteRecursion).not.toReportError(`start = "a" "" "" start`);
      expect(reportInfiniteRecursion).not.toReportError(`start = "" "a" "" start`);
      expect(reportInfiniteRecursion).not.toReportError(`start = "" "" "a" start`);
    });

    /* Regression test for #359. */
    it(`reports left recursion when rule reference is wrapped in an expression`, () => {
      expect(reportInfiniteRecursion).toReportError(`start = "" start?`);
    });

    it(`computes expressions that always consume input on success correctly`, () => {
      expect(reportInfiniteRecursion).toReportError(`start = a start\na "a" = ""`);
      expect(reportInfiniteRecursion).not.toReportError(`start = a start\na "a" = "a"`);

      expect(reportInfiniteRecursion).toReportError(`start = ("" / "a" / "b") start`);
      expect(reportInfiniteRecursion).toReportError(`start = ("a" / "" / "b") start`);
      expect(reportInfiniteRecursion).toReportError(`start = ("a" / "b" / "") start`);
      expect(reportInfiniteRecursion).not.toReportError(`start = ("a" / "b" / "c") start`);

      expect(reportInfiniteRecursion).toReportError(`start = ("" { }) start`);
      expect(reportInfiniteRecursion).not.toReportError(`start = ("a" { }) start`);

      expect(reportInfiniteRecursion).toReportError(`start = ("" "" "") start`);
      expect(reportInfiniteRecursion).not.toReportError(`start = ("a" "" "") start`);
      expect(reportInfiniteRecursion).not.toReportError(`start = ("" "a" "") start`);
      expect(reportInfiniteRecursion).not.toReportError(`start = ("" "" "a") start`);

      expect(reportInfiniteRecursion).toReportError(`start = a:"" start`);
      expect(reportInfiniteRecursion).not.toReportError(`start = a:"a" start`);

      expect(reportInfiniteRecursion).toReportError(`start = $"" start`);
      expect(reportInfiniteRecursion).not.toReportError(`start = $"a" start`);

      expect(reportInfiniteRecursion).toReportError(`start = &"" start`);
      expect(reportInfiniteRecursion).toReportError(`start = &"a" start`);

      expect(reportInfiniteRecursion).toReportError(`start = !"" start`);
      expect(reportInfiniteRecursion).toReportError(`start = !"a" start`);

      expect(reportInfiniteRecursion).toReportError(`start = ""? start`);
      expect(reportInfiniteRecursion).toReportError(`start = "a"? start`);

      expect(reportInfiniteRecursion).toReportError(`start = ""* start`);
      expect(reportInfiniteRecursion).toReportError(`start = "a"* start`);

      expect(reportInfiniteRecursion).toReportError(`start = ""+ start`);
      expect(reportInfiniteRecursion).not.toReportError(`start = "a"+ start`);

      expect(reportInfiniteRecursion).toReportError(`start = ("") start`);
      expect(reportInfiniteRecursion).not.toReportError(`start = ("a") start`);

      expect(reportInfiniteRecursion).toReportError(`start = &{ } start`);

      expect(reportInfiniteRecursion).toReportError(`start = !{ } start`);

      expect(reportInfiniteRecursion).toReportError(`start = a start\na = ""`);
      expect(reportInfiniteRecursion).not.toReportError(`start = a start\na = "a"`);

      expect(reportInfiniteRecursion).toReportError(`start = "" start`);
      expect(reportInfiniteRecursion).not.toReportError(`start = "a" start`);

      expect(reportInfiniteRecursion).not.toReportError(`start = [a-d] start`);

      expect(reportInfiniteRecursion).not.toReportError(`start = . start`);
    });
  });
});
