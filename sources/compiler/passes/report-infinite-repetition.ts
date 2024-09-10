import {GrammarError} from '../../grammar-error';
import * as asts      from '../asts';
import {visitor}      from '../visitor';

/*
 * Reports expressions that don't consume any input inside |*| or |+| in the
 * grammar, which prevents infinite loops in the generated parser.
 */
export function reportInfiniteRepetition(ast: asts.Ast) {
  visitor.run(ast, {
    zeroOrMore(visit, node) {
      if (!asts.alwaysConsumesOnSuccess(ast, node.expression)) {
        throw new GrammarError(
          `Possible infinite loop when parsing (repetition used with an expression that may not consume any input).`,
          node.location,
        );
      }
    },

    oneOrMore(visit, node) {
      if (!asts.alwaysConsumesOnSuccess(ast, node.expression)) {
        throw new GrammarError(
          `Possible infinite loop when parsing (repetition used with an expression that may not consume any input).`,
          node.location,
        );
      }
    },
  });

  return ast;
}
