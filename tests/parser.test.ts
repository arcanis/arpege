import * as asts from 'arpege/sources/compiler/asts';

import './compiler/passes/helpers';

describe(`PEG.js grammar parser`, () => {
  const literalAbcd = asts.node({type: `literal`, value: `abcd`, ignoreCase: false});
  const literalEfgh = asts.node({type: `literal`, value: `efgh`, ignoreCase: false});
  const literalIjkl = asts.node({type: `literal`, value: `ijkl`, ignoreCase: false});
  const literalMnop = asts.node({type: `literal`, value: `mnop`, ignoreCase: false});
  const semanticAnd = asts.node({type: `semanticAnd`, code: ` code `});
  const semanticNot = asts.node({type: `semanticNot`, code: ` code `});
  const optional = asts.node({type: `optional`, expression: literalAbcd});
  const zeroOrMore = asts.node({type: `zeroOrMore`, expression: literalAbcd});
  const oneOrMore = asts.node({type: `oneOrMore`, expression: literalAbcd});
  const textOptional = asts.node({type: `text`, expression: optional});
  const simpleNotAbcd = asts.node({type: `simpleNot`, expression: literalAbcd});
  const simpleAndOptional = asts.node({type: `simpleAnd`, expression: optional});
  const simpleNotOptional = asts.node({type: `simpleNot`, expression: optional});
  const labeledAbcd = asts.node({type: `labeled`, label: `a`, expression: literalAbcd});
  const labeledEfgh = asts.node({type: `labeled`, label: `b`, expression: literalEfgh});
  const labeledIjkl = asts.node({type: `labeled`, label: `c`, expression: literalIjkl});
  const labeledMnop = asts.node({type: `labeled`, label: `d`, expression: literalMnop});
  const labeledSimpleNot = asts.node({type: `labeled`, label: `a`, expression: simpleNotAbcd});
  const sequence = asts.node({type: `sequence`, elements: [literalAbcd, literalEfgh, literalIjkl]});
  const sequence2 = asts.node({type: `sequence`, elements: [labeledAbcd, labeledEfgh]});
  const sequence4 = asts.node({type: `sequence`, elements: [labeledAbcd, labeledEfgh, labeledIjkl, labeledMnop]});
  const groupLabeled = asts.node({type: `group`, expression: labeledAbcd});
  const groupSequence = asts.node({type: `group`, expression: sequence});
  const actionAbcd = asts.node({type: `action`, expression: literalAbcd, code: ` code `});
  const actionEfgh = asts.node({type: `action`, expression: literalEfgh, code: ` code `});
  const actionIjkl = asts.node({type: `action`, expression: literalIjkl, code: ` code `});
  const actionMnop = asts.node({type: `action`, expression: literalMnop, code: ` code `});
  const actionSequence = asts.node({type: `action`, expression: sequence, code: ` code `});
  const choice = asts.node({type: `choice`, alternatives: [literalAbcd, literalEfgh, literalIjkl]});
  const choice2 = asts.node({type: `choice`, alternatives: [actionAbcd, actionEfgh]});
  const choice4 = asts.node({type: `choice`, alternatives: [actionAbcd, actionEfgh, actionIjkl, actionMnop]});
  const named = asts.node({type: `named`, name: `start rule`, expression: literalAbcd});
  const ruleA = asts.node({type: `rule`, name: `a`, expression: literalAbcd});
  const ruleB = asts.node({type: `rule`, name: `b`, expression: literalEfgh});
  const ruleC = asts.node({type: `rule`, name: `c`, expression: literalIjkl});
  const ruleStart = asts.node({type: `rule`, name: `start`, expression: literalAbcd});
  const initializer = asts.node({type: `initializer`, code: ` code `});

  function oneRuleGrammar(expression: asts.Expression) {
    return {
      type: `grammar`,
      initializer: null,
      rules: [{type: `rule`, name: `start`, expression}],
    };
  }

  function actionGrammar(code: string) {
    return oneRuleGrammar(
      {type: `action`, expression: literalAbcd, code},
    );
  }

  function literalGrammar(value: string, ignoreCase: boolean) {
    return oneRuleGrammar(
      {type: `literal`, value, ignoreCase},
    );
  }

  function classGrammar(parts: Array<[string, string] | string>, inverted: boolean, ignoreCase: boolean) {
    return oneRuleGrammar({
      type: `class`,
      parts,
      inverted,
      ignoreCase,
    });
  }

  function anyGrammar() {
    return oneRuleGrammar({type: `any`});
  }

  function ruleRefGrammar(name: string) {
    return oneRuleGrammar({type: `ruleRef`, name});
  }

  var trivialGrammar = literalGrammar(`abcd`, false),
    twoRuleGrammar = {
      type: `grammar`,
      initializer: null,
      rules: [ruleA, ruleB],
    };

  /* Canonical Grammar is "a = \"abcd\"; b = \"efgh\"; c = \"ijkl\";". */
  it(`parses Grammar`, () => {
    expect(`\na = "abcd";\n`).toParseAs(
      {type: `grammar`, initializer: null, rules: [ruleA]},
    );
    expect(`\na = "abcd";\nb = "efgh";\nc = "ijkl";\n`).toParseAs(
      {type: `grammar`, initializer: null, rules: [ruleA, ruleB, ruleC]},
    );
    expect(`\n{ code };\na = "abcd";\n`).toParseAs(
      {type: `grammar`, initializer, rules: [ruleA]},
    );
  });

  /* Canonical Initializer is "{ code }". */
  it(`parses Initializer`, () => {
    expect(`{ code };start = "abcd"`).toParseAs(
      {type: `grammar`, initializer, rules: [ruleStart]},
    );
  });

  /* Canonical Rule is "a = \"abcd\";". */
  it(`parses Rule`, () => {
    expect(`start\n=\n"abcd";`).toParseAs(
      oneRuleGrammar(literalAbcd),
    );
    expect(`start\n"start rule"\n=\n"abcd";`).toParseAs(
      oneRuleGrammar(named),
    );
  });

  /* Canonical Expression is "\"abcd\"". */
  it(`parses Expression`, () => {
    expect(`start = "abcd" / "efgh" / "ijkl"`).toParseAs(
      oneRuleGrammar(choice),
    );
  });

  /* Canonical ChoiceExpression is "\"abcd\" / \"efgh\" / \"ijkl\"". */
  it(`parses ChoiceExpression`, () => {
    expect(`start = "abcd" { code }`).toParseAs(
      oneRuleGrammar(actionAbcd),
    );
    expect(`start = "abcd" { code }\n/\n"efgh" { code }`).toParseAs(
      oneRuleGrammar(choice2),
    );
    expect(
      `start = "abcd" { code }\n/\n"efgh" { code }\n/\n"ijkl" { code }\n/\n"mnop" { code }`,
    ).toParseAs(
      oneRuleGrammar(choice4),
    );
  });

  /* Canonical ActionExpression is "\"abcd\" { code }". */
  it(`parses ActionExpression`, () => {
    expect(`start = "abcd" "efgh" "ijkl"`).toParseAs(
      oneRuleGrammar(sequence),
    );
    expect(`start = "abcd" "efgh" "ijkl"\n{ code }`).toParseAs(
      oneRuleGrammar(actionSequence),
    );
  });

  /* Canonical SequenceExpression is "\"abcd\" \"efgh\" \"ijkl\"". */
  it(`parses SequenceExpression`, () => {
    expect(`start = a:"abcd"`).toParseAs(
      oneRuleGrammar(labeledAbcd),
    );
    expect(`start = a:"abcd"\nb:"efgh"`).toParseAs(
      oneRuleGrammar(sequence2),
    );
    expect(`start = a:"abcd"\nb:"efgh"\nc:"ijkl"\nd:"mnop"`).toParseAs(
      oneRuleGrammar(sequence4),
    );
  });

  /* Canonical LabeledExpression is "a:\"abcd\"". */
  it(`parses LabeledExpression`, () => {
    expect(`start = a\n:\n!"abcd"`).toParseAs(oneRuleGrammar(labeledSimpleNot));
    expect(`start = !"abcd"`).toParseAs(oneRuleGrammar(simpleNotAbcd));
  });

  /* Canonical PrefixedExpression is "!\"abcd\"". */
  it(`parses PrefixedExpression`, () => {
    expect(`start = !\n"abcd"?`).toParseAs(oneRuleGrammar(simpleNotOptional));
    expect(`start = "abcd"?`).toParseAs(oneRuleGrammar(optional));
  });

  /* Canonical PrefixedOperator is "!". */
  it(`parses PrefixedOperator`, () => {
    expect(`start = $"abcd"?`).toParseAs(oneRuleGrammar(textOptional));
    expect(`start = &"abcd"?`).toParseAs(oneRuleGrammar(simpleAndOptional));
    expect(`start = !"abcd"?`).toParseAs(oneRuleGrammar(simpleNotOptional));
  });

  /* Canonical SuffixedExpression is "\"ebcd\"?". */
  it(`parses SuffixedExpression`, () => {
    expect(`start = "abcd"\n?`).toParseAs(oneRuleGrammar(optional));
    expect(`start = "abcd"`).toParseAs(oneRuleGrammar(literalAbcd));
  });

  /* Canonical SuffixedOperator is "?". */
  it(`parses SuffixedOperator`, () => {
    expect(`start = "abcd"?`).toParseAs(oneRuleGrammar(optional));
    expect(`start = "abcd"*`).toParseAs(oneRuleGrammar(zeroOrMore));
    expect(`start = "abcd"+`).toParseAs(oneRuleGrammar(oneOrMore));
  });

  /* Canonical PrimaryExpression is "\"abcd\"". */
  it(`parses PrimaryExpression`, () => {
    expect(`start = "abcd"`).toParseAs(trivialGrammar);
    expect(`start = [a-d]`).toParseAs(classGrammar([[`a`, `d`]], false, false));
    expect(`start = .`).toParseAs(anyGrammar());
    expect(`start = a`).toParseAs(ruleRefGrammar(`a`));
    expect(`start = &{ code }`).toParseAs(oneRuleGrammar(semanticAnd));

    expect(`start = (\na:"abcd"\n)`).toParseAs(oneRuleGrammar(groupLabeled));
    expect(`start = (\n"abcd" "efgh" "ijkl"\n)`).toParseAs(oneRuleGrammar(groupSequence));
    expect(`start = (\n"abcd"\n)`).toParseAs(trivialGrammar);
  });

  /* Canonical RuleReferenceExpression is "a". */
  it(`parses RuleReferenceExpression`, () => {
    expect(`start = a`).toParseAs(ruleRefGrammar(`a`));

    expect(`start = a\n=`).toFailToParse();
    expect(`start = a\n"abcd"\n=`).toFailToParse();
  });

  /* Canonical SemanticPredicateExpression is "!{ code }". */
  it(`parses SemanticPredicateExpression`, () => {
    expect(`start = !\n{ code }`).toParseAs(oneRuleGrammar(semanticNot));
  });

  /* Canonical SemanticPredicateOperator is "!". */
  it(`parses SemanticPredicateOperator`, () => {
    expect(`start = &{ code }`).toParseAs(oneRuleGrammar(semanticAnd));
    expect(`start = !{ code }`).toParseAs(oneRuleGrammar(semanticNot));
  });

  /* The SourceCharacter rule is not tested. */

  /* Canonical WhiteSpace is " ". */
  it(`parses WhiteSpace`, () => {
    expect(`start =\t"abcd"`).toParseAs(trivialGrammar);
    expect(`start =\x0B"abcd"`).toParseAs(trivialGrammar);   // no "\v" in IE
    expect(`start =\f"abcd"`).toParseAs(trivialGrammar);
    expect(`start = "abcd"`).toParseAs(trivialGrammar);
    expect(`start =\u00A0"abcd"`).toParseAs(trivialGrammar);
    expect(`start =\uFEFF"abcd"`).toParseAs(trivialGrammar);
    expect(`start =\u1680"abcd"`).toParseAs(trivialGrammar);
  });

  /* Canonical LineTerminator is "\n". */
  it(`parses LineTerminator`, () => {
    expect(`start = "\n"`).toFailToParse();
    expect(`start = "\r"`).toFailToParse();
    expect(`start = "\u2028"`).toFailToParse();
    expect(`start = "\u2029"`).toFailToParse();
  });

  /* Canonical LineTerminatorSequence is "\r\n". */
  it(`parses LineTerminatorSequence`, () => {
    expect(`start =\n"abcd"`).toParseAs(trivialGrammar);
    expect(`start =\r\n"abcd"`).toParseAs(trivialGrammar);
    expect(`start =\r"abcd"`).toParseAs(trivialGrammar);
    expect(`start =\u2028"abcd"`).toParseAs(trivialGrammar);
    expect(`start =\u2029"abcd"`).toParseAs(trivialGrammar);
  });

  // Canonical Comment is "/* comment */".
  it(`parses Comment`, () => {
    expect(`start =// comment\n"abcd"`).toParseAs(trivialGrammar);
    expect(`start =/* comment */"abcd"`).toParseAs(trivialGrammar);
  });

  // Canonical MultiLineComment is "/* comment */".
  it(`parses MultiLineComment`, () => {
    expect(`start =/**/"abcd"`).toParseAs(trivialGrammar);
    expect(`start =/*a*/"abcd"`).toParseAs(trivialGrammar);
    expect(`start =/*abc*/"abcd"`).toParseAs(trivialGrammar);

    expect(`start =/**/*/"abcd"`).toFailToParse();
  });

  // Canonical MultiLineCommentNoLineTerminator is "/* comment */".
  it(`parses MultiLineCommentNoLineTerminator`, () => {
    expect(`a = "abcd"/**/\r\nb = "efgh"`).toParseAs(twoRuleGrammar);
    expect(`a = "abcd"/*a*/\r\nb = "efgh"`).toParseAs(twoRuleGrammar);
    expect(`a = "abcd"/*abc*/\r\nb = "efgh"`).toParseAs(twoRuleGrammar);

    expect(`a = "abcd"/**/*/\r\nb = "efgh"`).toFailToParse();
    expect(`a = "abcd"/*\n*/\r\nb = "efgh"`).toFailToParse();
  });

  /* Canonical SingleLineComment is "// comment". */
  it(`parses SingleLineComment`, () => {
    expect(`start =//\n"abcd"`).toParseAs(trivialGrammar);
    expect(`start =//a\n"abcd"`).toParseAs(trivialGrammar);
    expect(`start =//abc\n"abcd"`).toParseAs(trivialGrammar);

    expect(`start =//\n@\n"abcd"`).toFailToParse();
  });

  /* Canonical Identifier is "a". */
  it(`parses Identifier`, () => {
    expect(`start = a:"abcd"`).toParseAs(oneRuleGrammar(labeledAbcd));
  });

  /* Canonical IdentifierName is "a". */
  it(`parses IdentifierName`, () => {
    expect(`start = a`).toParseAs(ruleRefGrammar(`a`));
    expect(`start = ab`).toParseAs(ruleRefGrammar(`ab`));
    expect(`start = abcd`).toParseAs(ruleRefGrammar(`abcd`));
  });

  /* Canonical IdentifierStart is "a". */
  it(`parses IdentifierStart`, () => {
    expect(`start = a`).toParseAs(ruleRefGrammar(`a`));
    expect(`start = $`).toParseAs(ruleRefGrammar(`$`));
    expect(`start = _`).toParseAs(ruleRefGrammar(`_`));
    expect(`start = \\u0061`).toParseAs(ruleRefGrammar(`a`));
  });

  /* Canonical IdentifierPart is "a". */
  it(`parses IdentifierPart`, () => {
    expect(`start = aa`).toParseAs(ruleRefGrammar(`aa`));
    expect(`start = a\u0300`).toParseAs(ruleRefGrammar(`a\u0300`));
    expect(`start = a0`).toParseAs(ruleRefGrammar(`a0`));
    expect(`start = a\u203F`).toParseAs(ruleRefGrammar(`a\u203F`));
    expect(`start = a\u200C`).toParseAs(ruleRefGrammar(`a\u200C`));
    expect(`start = a\u200D`).toParseAs(ruleRefGrammar(`a\u200D`));
  });

  /* Unicode rules and reserved word rules are not tested. */

  /* Canonical LiteralMatcher is "\"abcd\"". */
  it(`parses LiteralMatcher`, () => {
    expect(`start = "abcd"`).toParseAs(literalGrammar(`abcd`, false));
    expect(`start = "abcd"i`).toParseAs(literalGrammar(`abcd`, true));
  });

  /* Canonical StringLiteral is "\"abcd\"". */
  it(`parses StringLiteral`, () => {
    expect(`start = ""`).toParseAs(literalGrammar(``,    false));
    expect(`start = "a"`).toParseAs(literalGrammar(`a`,   false));
    expect(`start = "abc"`).toParseAs(literalGrammar(`abc`, false));

    expect(`start = ''`).toParseAs(literalGrammar(``,    false));
    expect(`start = 'a'`).toParseAs(literalGrammar(`a`,   false));
    expect(`start = 'abc'`).toParseAs(literalGrammar(`abc`, false));
  });

  /* Canonical DoubleStringCharacter is "a". */
  it(`parses DoubleStringCharacter`, () => {
    expect(`start = "a"`).toParseAs(literalGrammar(`a`,  false));
    expect(`start = "\\n"`).toParseAs(literalGrammar(`\n`, false));
    expect(`start = "\\\n"`).toParseAs(literalGrammar(``,   false));

    expect(`start = """`).toFailToParse();
    expect(`start = "\\"`).toFailToParse();
    expect(`start = "\n"`).toFailToParse();
  });

  /* Canonical SingleStringCharacter is "a". */
  it(`parses SingleStringCharacter`, () => {
    expect(`start = 'a'`).toParseAs(literalGrammar(`a`,  false));
    expect(`start = '\\n'`).toParseAs(literalGrammar(`\n`, false));
    expect(`start = '\\\n'`).toParseAs(literalGrammar(``,   false));

    expect(`start = '''`).toFailToParse();
    expect(`start = '\\'`).toFailToParse();
    expect(`start = '\n'`).toFailToParse();
  });

  /* Canonical CharacterClassMatcher is "[a-d]". */
  it(`parses CharacterClassMatcher`, () => {
    expect(`start = []`).toParseAs(
      classGrammar([], false, false),
    );
    expect(`start = [a-d]`).toParseAs(
      classGrammar([[`a`, `d`]], false, false),
    );
    expect(`start = [a]`).toParseAs(
      classGrammar([`a`], false, false),
    );
    expect(`start = [a-de-hi-l]`).toParseAs(
      classGrammar(
        [[`a`, `d`], [`e`, `h`], [`i`, `l`]],
        false,
        false,
      ),
    );
    expect(`start = [^a-d]`).toParseAs(
      classGrammar([[`a`, `d`]], true, false),
    );
    expect(`start = [a-d]i`).toParseAs(
      classGrammar([[`a`, `d`]], false, true),
    );

    expect(`start = [\\\n]`).toParseAs(
      classGrammar([], false, false),
    );
  });

  /* Canonical ClassCharacterRange is "a-d". */
  it(`parses ClassCharacterRange`, () => {
    expect(`start = [a-d]`).toParseAs(classGrammar([[`a`, `d`]], false, false));

    expect(`start = [a-a]`).toParseAs(classGrammar([[`a`, `a`]], false, false));
    expect(`start = [b-a]`).toFailToParse({
      message: `Invalid character range: b-a.`,
    });
  });

  /* Canonical ClassCharacter is "a". */
  it(`parses ClassCharacter`, () => {
    expect(`start = [a]`).toParseAs(classGrammar([`a`],  false, false));
    expect(`start = [\\n]`).toParseAs(classGrammar([`\n`], false, false));
    expect(`start = [\\\n]`).toParseAs(classGrammar([],     false, false));

    expect(`start = []]`).toFailToParse();
    expect(`start = [\\]`).toFailToParse();
    expect(`start = [\n]`).toFailToParse();
  });

  /* Canonical LineContinuation is "\\\n". */
  it(`parses LineContinuation`, () => {
    expect(`start = "\\\r\n"`).toParseAs(literalGrammar(``, false));
  });

  /* Canonical EscapeSequence is "n". */
  it(`parses EscapeSequence`, () => {
    expect(`start = "\\n"`).toParseAs(literalGrammar(`\n`,     false));
    expect(`start = "\\0"`).toParseAs(literalGrammar(`\x00`,   false));
    expect(`start = "\\xFF"`).toParseAs(literalGrammar(`\xFF`,   false));
    expect(`start = "\\uFFFF"`).toParseAs(literalGrammar(`\uFFFF`, false));

    expect(`start = "\\09"`).toFailToParse();
  });

  /* Canonical CharacterEscapeSequence is "n". */
  it(`parses CharacterEscapeSequence`, () => {
    expect(`start = "\\n"`).toParseAs(literalGrammar(`\n`, false));
    expect(`start = "\\a"`).toParseAs(literalGrammar(`a`,  false));
  });

  /* Canonical SingleEscapeCharacter is "n". */
  it(`parses SingleEscapeCharacter`, () => {
    expect(`start = "\\'"`).toParseAs(literalGrammar(`'`,    false));
    expect(`start = "\\""`).toParseAs(literalGrammar(`"`,    false));
    expect(`start = "\\\\"`).toParseAs(literalGrammar(`\\`,   false));
    expect(`start = "\\b"`).toParseAs(literalGrammar(`\b`,   false));
    expect(`start = "\\f"`).toParseAs(literalGrammar(`\f`,   false));
    expect(`start = "\\n"`).toParseAs(literalGrammar(`\n`,   false));
    expect(`start = "\\r"`).toParseAs(literalGrammar(`\r`,   false));
    expect(`start = "\\t"`).toParseAs(literalGrammar(`\t`,   false));
    expect(`start = "\\v"`).toParseAs(literalGrammar(`\x0B`, false));   // no "\v" in IE
  });

  /* Canonical NonEscapeCharacter is "a". */
  it(`parses NonEscapeCharacter`, () => {
    expect(`start = "\\a"`).toParseAs(literalGrammar(`a`, false));

    /*
     * The negative predicate is impossible to test with PEG.js grammar
     * structure.
     */
  });

  /*
   * The EscapeCharacter rule is impossible to test with PEG.js grammar
   * structure.
   */

  /* Canonical HexEscapeSequence is "xFF". */
  it(`parses HexEscapeSequence`, () => {
    expect(`start = "\\xFF"`).toParseAs(literalGrammar(`\xFF`, false));
  });

  /* Canonical UnicodeEscapeSequence is "uFFFF". */
  it(`parses UnicodeEscapeSequence`, () => {
    expect(`start = "\\uFFFF"`).toParseAs(literalGrammar(`\uFFFF`, false));
  });

  /* Digit rules are not tested. */

  /* Canonical AnyMatcher is ".". */
  it(`parses AnyMatcher`, () => {
    expect(`start = .`).toParseAs(anyGrammar());
  });

  /* Canonical CodeBlock is "{ code }". */
  it(`parses CodeBlock`, () => {
    expect(`start = "abcd" { code }`).toParseAs(actionGrammar(` code `));
  });

  /* Canonical Code is " code ". */
  it(`parses Code`, () => {
    expect(`start = "abcd" {a}`).toParseAs(actionGrammar(`a`));
    expect(`start = "abcd" {abc}`).toParseAs(actionGrammar(`abc`));
    expect(`start = "abcd" {{a}}`).toParseAs(actionGrammar(`{a}`));
    expect(`start = "abcd" {{a}{b}{c}}`).toParseAs(actionGrammar(`{a}{b}{c}`));

    expect(`start = "abcd" {{}`).toFailToParse();
    expect(`start = "abcd" {}}`).toFailToParse();
  });

  /* Unicode character category rules and token rules are not tested. */

  /* Canonical __ is "\n". */
  it(`parses __`, () => {
    expect(`start ="abcd"`).toParseAs(trivialGrammar);
    expect(`start = "abcd"`).toParseAs(trivialGrammar);
    expect(`start =\r\n"abcd"`).toParseAs(trivialGrammar);
    expect(`start =/* comment */"abcd"`).toParseAs(trivialGrammar);
    expect(`start =   "abcd"`).toParseAs(trivialGrammar);
  });

  /* Canonical _ is " ". */
  it(`parses _`, () => {
    expect(`a = "abcd"\r\nb = "efgh"`).toParseAs(twoRuleGrammar);
    expect(`a = "abcd" \r\nb = "efgh"`).toParseAs(twoRuleGrammar);
    expect(`a = "abcd"/* comment */\r\nb = "efgh"`).toParseAs(twoRuleGrammar);
    expect(`a = "abcd"   \r\nb = "efgh"`).toParseAs(twoRuleGrammar);
  });

  /* Canonical EOS is ";". */
  it(`parses EOS`, () => {
    expect(`a = "abcd"\n;b = "efgh"`).toParseAs(twoRuleGrammar);
    expect(`a = "abcd" \r\nb = "efgh"`).toParseAs(twoRuleGrammar);
    expect(`a = "abcd" // comment\r\nb = "efgh"`).toParseAs(twoRuleGrammar);
    expect(`a = "abcd"\nb = "efgh"`).toParseAs(twoRuleGrammar);
  });

  /* Canonical EOF is the end of input. */
  it(`parses EOF`, () => {
    expect(`start = "abcd"\n`).toParseAs(trivialGrammar);
  });
});
