import * as asts from './compiler/asts';

/* Thrown when the grammar contains an error. */
export class GrammarError extends Error {
  constructor(message: string, public location?: asts.Location) {
    if (location)
      message = message.replace(/\.$/, ` at line ${location.start.line}, column ${location.start.column}.`);

    super(message);

    this.name = `GrammarError`;

    if (typeof Error.captureStackTrace === `function`) {
      Error.captureStackTrace(this, GrammarError);
    }
  }
}
