/* eslint-disable */

interface PegJSPosition {
  offset: number;
  line: number;
  column: number;
}

interface PegJSLocation {
  start: PegJSPosition;
  end: PegJSPosition;
}

const OPS_TO_PREFIXED_TYPES = {
  [`$`]: literal(`text`),
  [`&`]: literal(`simpleAnd`),
  [`!`]: literal(`simpleNot`),
};

const OPS_TO_SUFFIXED_TYPES = {
  [`?`]: literal(`optional`),
  [`*`]: literal(`zeroOrMore`),
  [`+`]: literal(`oneOrMore`),
};

const OPS_TO_SEMANTIC_PREDICATE_TYPES = {
  [`&`]: literal(`semanticAnd`),
  [`!`]: literal(`semanticNot`),
};

function filterEmptyStrings(array) {
  const result = [];

  for (let i = 0; i < array.length; i++)
    if (array[i] !== ``) result.push(array[i]);

  return result;
}

const peg$type$action0 = (
  initializer: ast.Initializer | null,
  rules: Array<ast.Rule>,
) => {
  return {
    type: literal(`grammar`),
    location: location(),
    initializer,
    rules,
  };
};
const peg$type$action1 = (code: ast.CodeBlock) => {
  return {
    type: literal(`initializer`),
    location: location(),
    code: code,
  };
};
const peg$type$action2 = (
  name: ast.IdentifierName,
  displayName: ast.StringLiteral | null,
  expression: ast.Expression,
) => {
  return {
    type: literal(`rule`),
    location: location(),
    name,
    expression:
      displayName === null
        ? expression
        : {
            type: literal(`named`),
            location: location(),
            name: displayName,
            expression,
          },
  };
};
const peg$type$action3 = (value: ast.Annotation) => {
  return value;
};
const peg$type$action4 = (value: ast.Annotation) => {
  return value;
};
const peg$type$action5 = (
  head: ast.Annotation,
  tail: Array<ReturnType<typeof peg$type$action3>>,
) => {
  return [head, ...tail];
};
const peg$type$action6 = (value: ast.Annotation) => {
  return value;
};
const peg$type$action7 = (value: ast.Annotation) => {
  return value;
};
const peg$type$action8 = (
  head: ast.Annotation,
  tail: Array<ReturnType<typeof peg$type$action6>>,
) => {
  return [head, ...tail];
};
const peg$type$action9 = (
  value: ReturnType<typeof peg$type$action5> | null,
) => {
  return value ?? [];
};
const peg$type$action10 = (value: ast.Annotation) => {
  return value;
};
const peg$type$action11 = (value: ast.Annotation) => {
  return value;
};
const peg$type$action12 = (
  head: ast.Annotation,
  tail: Array<ReturnType<typeof peg$type$action10>>,
) => {
  return [head, ...tail];
};
const peg$type$action13 = (value: ast.Annotation) => {
  return value;
};
const peg$type$action14 = (value: ast.Annotation) => {
  return value;
};
const peg$type$action15 = (
  head: ast.Annotation,
  tail: Array<ReturnType<typeof peg$type$action13>>,
) => {
  return [head, ...tail];
};
const peg$type$action16 = (
  value: ReturnType<typeof peg$type$action12> | null,
) => {
  return value ?? [];
};
const peg$type$action17 = (
  annotations: ReturnType<typeof peg$type$action9>,
  expression: ast.LeadingChoiceExpression,
) => {
  return {
    ...expression,
    annotations: annotations.length > 0 ? annotations : undefined,
  };
};
const peg$type$action18 = (expression: ast.ChoiceExpression) => {
  return expression;
};
const peg$type$action19 = (value: ast.ScopeExpression) => {
  return value;
};
const peg$type$action20 = (value: ast.ScopeExpression) => {
  return value;
};
const peg$type$action21 = (
  head: ast.ScopeExpression,
  tail: Array<ReturnType<typeof peg$type$action19>>,
) => {
  return [head, ...tail];
};
const peg$type$action22 = (value: ast.ScopeExpression) => {
  return value;
};
const peg$type$action23 = (value: ast.ScopeExpression) => {
  return value;
};
const peg$type$action24 = (
  head: ast.ScopeExpression,
  tail: Array<ReturnType<typeof peg$type$action22>>,
) => {
  return [head, ...tail];
};
const peg$type$action25 = (
  alternatives: ReturnType<typeof peg$type$action21>,
) => {
  return alternatives.length === 1
    ? alternatives[0]
    : {
        type: literal(`choice`),
        location: location(),
        alternatives,
      };
};
const peg$type$action26 = (
  expression: ast.ActionExpression,
  code: ast.CodeBlock,
) => {
  return {
    type: literal(`scope`),
    location: location(),
    code,
    expression,
  };
};
const peg$type$action27 = (
  expression: ast.SequenceExpression,
  code: ast.CodeBlock | null,
) => {
  return code === null
    ? expression
    : {
        type: literal(`action`),
        location: location(),
        code: code ?? ``,
        expression,
      };
};
const peg$type$action28 = (value: ast.LabeledExpression) => {
  return value;
};
const peg$type$action29 = (value: ast.LabeledExpression) => {
  return value;
};
const peg$type$action30 = (
  head: ast.LabeledExpression,
  tail: Array<ReturnType<typeof peg$type$action28>>,
) => {
  return [head, ...tail];
};
const peg$type$action31 = (value: ast.LabeledExpression) => {
  return value;
};
const peg$type$action32 = (value: ast.LabeledExpression) => {
  return value;
};
const peg$type$action33 = (
  head: ast.LabeledExpression,
  tail: Array<ReturnType<typeof peg$type$action31>>,
) => {
  return [head, ...tail];
};
const peg$type$action34 = (elements: ReturnType<typeof peg$type$action30>) => {
  return elements.length === 1
    ? elements[0]
    : {
        type: literal(`sequence`),
        location: location(),
        elements,
      };
};
const peg$type$action35 = (
  label: ast.Identifier,
  expression: ast.PrefixedExpression,
) => {
  return {
    type: literal(`labeled`),
    location: location(),
    label,
    expression,
  };
};
const peg$type$action36 = (expression: ast.PrefixedExpression) => {
  return {
    type: literal(`labeled`),
    location: location(),
    label: null,
    expression,
  };
};
const peg$type$action37 = (
  operator: ast.PrefixedOperator,
  expression: ast.SuffixedExpression,
) => {
  return {
    type: OPS_TO_PREFIXED_TYPES[operator],
    location: location(),
    expression,
  };
};
const peg$type$action38 = (
  expression: ast.PrimaryExpression,
  operator: ast.SuffixedOperator,
) => {
  return {
    type: OPS_TO_SUFFIXED_TYPES[operator],
    location: location(),
    expression,
  };
};
const peg$type$action39 = (name: ast.IdentifierName) => {
  return {
    type: literal(`ruleRef`),
    location: location(),
    name,
  };
};
const peg$type$action40 = (
  operator: ast.SemanticPredicateOperator,
  code: ast.CodeBlock,
) => {
  return {
    type: OPS_TO_SEMANTIC_PREDICATE_TYPES[operator],
    location: location(),
    code,
  };
};
const peg$type$action41 = (
  head: ast.IdentifierStart,
  tail: Array<ast.IdentifierPart>,
) => {
  return head + tail.join(``);
};
const peg$type$action42 = (sequence: ast.UnicodeEscapeSequence) => {
  return sequence;
};
const peg$type$action43 = (name: ast.Identifier) => {
  return name;
};
const peg$type$action44 = (name: ast.Identifier) => {
  return name;
};
const peg$type$action45 = (parameters: ast.AnnotationParameters | null) => {
  return parameters;
};
const peg$type$action46 = (parameters: ast.AnnotationParameters | null) => {
  return parameters;
};
const peg$type$action47 = (
  name: ReturnType<typeof peg$type$action43>,
  parameters: ReturnType<typeof peg$type$action45> | null,
) => {
  return {
    name,
    parameters: parameters ?? {},
  };
};
const peg$type$action48 = (value: ast.AnnotationParameter) => {
  return value;
};
const peg$type$action49 = (value: ast.AnnotationParameter) => {
  return value;
};
const peg$type$action50 = (
  head: ast.AnnotationParameter,
  tail: Array<ReturnType<typeof peg$type$action48>>,
) => {
  return [head, ...tail];
};
const peg$type$action51 = (value: ast.AnnotationParameter) => {
  return value;
};
const peg$type$action52 = (value: ast.AnnotationParameter) => {
  return value;
};
const peg$type$action53 = (
  head: ast.AnnotationParameter,
  tail: Array<ReturnType<typeof peg$type$action51>>,
) => {
  return [head, ...tail];
};
const peg$type$action54 = (
  value: ReturnType<typeof peg$type$action50> | null,
) => {
  return value ?? [];
};
const peg$type$action55 = (value: ast.AnnotationParameter) => {
  return value;
};
const peg$type$action56 = (value: ast.AnnotationParameter) => {
  return value;
};
const peg$type$action57 = (
  head: ast.AnnotationParameter,
  tail: Array<ReturnType<typeof peg$type$action55>>,
) => {
  return [head, ...tail];
};
const peg$type$action58 = (value: ast.AnnotationParameter) => {
  return value;
};
const peg$type$action59 = (value: ast.AnnotationParameter) => {
  return value;
};
const peg$type$action60 = (
  head: ast.AnnotationParameter,
  tail: Array<ReturnType<typeof peg$type$action58>>,
) => {
  return [head, ...tail];
};
const peg$type$action61 = (
  value: ReturnType<typeof peg$type$action57> | null,
) => {
  return value ?? [];
};
const peg$type$action62 = (
  parameterList: ReturnType<typeof peg$type$action54>,
) => {
  return Object.fromEntries(parameterList);
};
const peg$type$action63 = (name: ast.Identifier, expression: unknown) => {
  return tuple([name, expression]);
};
const peg$type$action64 = (name: ast.Identifier, value: ast.ValueLiteral) => {
  return tuple([name, value]);
};
const peg$type$action65 = (
  value: ast.StringLiteral,
  ignoreCase: "i" | null,
) => {
  return {
    type: literal(`literal`),
    location: location(),
    ignoreCase: ignoreCase !== null,
    value,
  };
};
const peg$type$action66 = () => {
  return JSON.parse(text());
};
const peg$type$action67 = () => {
  return null;
};
const peg$type$action68 = (values: ast.ArrayValues | null) => {
  return values ?? [];
};
const peg$type$action69 = (value: ast.ValueLiteral) => {
  return value;
};
const peg$type$action70 = (value: ast.ValueLiteral) => {
  return value;
};
const peg$type$action71 = (
  head: ast.ValueLiteral,
  tail: Array<ReturnType<typeof peg$type$action69>>,
) => {
  return [head, ...tail];
};
const peg$type$action72 = (value: ast.ValueLiteral) => {
  return value;
};
const peg$type$action73 = (value: ast.ValueLiteral) => {
  return value;
};
const peg$type$action74 = (
  head: ast.ValueLiteral,
  tail: Array<ReturnType<typeof peg$type$action72>>,
) => {
  return [head, ...tail];
};
const peg$type$action75 = (
  value: ReturnType<typeof peg$type$action71> | null,
) => {
  return value ?? [];
};
const peg$type$action76 = (chars: Array<ast.BacktickStringCharacter>) => {
  return chars.join(``);
};
const peg$type$action77 = (chars: Array<ast.DoubleStringCharacter>) => {
  return chars.join(``);
};
const peg$type$action78 = (chars: Array<ast.SingleStringCharacter>) => {
  return chars.join(``);
};
const peg$type$action79 = () => {
  return text();
};
const peg$type$action80 = (sequence: ast.EscapeSequence) => {
  return sequence;
};
const peg$type$action81 = () => {
  return text();
};
const peg$type$action82 = (sequence: ast.EscapeSequence) => {
  return sequence;
};
const peg$type$action83 = () => {
  return text();
};
const peg$type$action84 = (sequence: ast.EscapeSequence) => {
  return sequence;
};
const peg$type$action85 = (
  inverted: "^" | null,
  parts: Array<ast.ClassCharacterRange | ast.ClassCharacter>,
  ignoreCase: "i" | null,
) => {
  return {
    type: literal(`class`),
    location: location(),
    parts: filterEmptyStrings(parts),
    inverted: inverted !== null,
    ignoreCase: ignoreCase !== null,
  };
};
const peg$type$action86 = (
  begin: ast.ClassCharacter,
  end: ast.ClassCharacter,
) => {
  if (begin.charCodeAt(0) > end.charCodeAt(0))
    error(`Invalid character range: ${text()}.`);

  return tuple([begin, end]);
};
const peg$type$action87 = () => {
  return text();
};
const peg$type$action88 = (sequence: ast.EscapeSequence) => {
  return sequence;
};
const peg$type$action89 = () => {
  return ``;
};
const peg$type$action90 = () => {
  return `\0`;
};
const peg$type$action91 = () => {
  return `\b`;
};
const peg$type$action92 = () => {
  return `\f`;
};
const peg$type$action93 = () => {
  return `\n`;
};
const peg$type$action94 = () => {
  return `\r`;
};
const peg$type$action95 = () => {
  return `\t`;
};
const peg$type$action96 = () => {
  return `\x0B`;
};
const peg$type$action97 = () => {
  return text();
};
const peg$type$action98 = (digits: string) => {
  return String.fromCharCode(parseInt(digits, 16));
};
const peg$type$action99 = (digits: string) => {
  return String.fromCharCode(parseInt(digits, 16));
};
const peg$type$action100 = () => {
  return {
    type: literal(`any`),
    location: location(),
  };
};
const peg$type$action101 = (code: ast.Code) => {
  return code;
};

namespace ast {
  export type Grammar = ReturnType<typeof peg$type$action0>;
  export type Initializer = ReturnType<typeof peg$type$action1>;
  export type Rule = ReturnType<typeof peg$type$action2>;
  export type Expression = ReturnType<typeof peg$type$action17>;
  export type LeadingChoiceExpression = ReturnType<typeof peg$type$action18>;
  export type ChoiceExpression = ReturnType<typeof peg$type$action25>;
  export type ScopeExpression =
    | ReturnType<typeof peg$type$action26>
    | ast.ActionExpression;
  export type ActionExpression = ReturnType<typeof peg$type$action27>;
  export type SequenceExpression = ReturnType<typeof peg$type$action34>;
  export type LabeledExpression =
    | ReturnType<typeof peg$type$action35>
    | ReturnType<typeof peg$type$action36>
    | ast.PrefixedExpression;
  export type PrefixedExpression =
    | ReturnType<typeof peg$type$action37>
    | ast.SuffixedExpression;
  export type PrefixedOperator = "$" | "&" | "!";
  export type SuffixedExpression =
    | ReturnType<typeof peg$type$action38>
    | ast.PrimaryExpression;
  export type SuffixedOperator = "?" | "*" | "+";
  export type PrimaryExpression =
    | ast.LiteralMatcher
    | ast.CharacterClassMatcher
    | ast.AnyMatcher
    | ast.RuleReferenceExpression
    | ast.SemanticPredicateExpression
    | never;
  export type RuleReferenceExpression = ReturnType<typeof peg$type$action39>;
  export type SemanticPredicateExpression = ReturnType<
    typeof peg$type$action40
  >;
  export type SemanticPredicateOperator = "&" | "!";
  export type SourceCharacter = string;
  export type WhiteSpace =
    | "\t"
    | "\u000b"
    | "\f"
    | " "
    | "\u00a0"
    | "\ufeff"
    | ast.Zs;
  export type LineTerminator = string;
  export type LineTerminatorSequence =
    | "\n"
    | "\r\n"
    | "\r"
    | "\u2028"
    | "\u2029";
  export type Comment = ast.MultiLineComment | ast.SingleLineComment;
  export type MultiLineComment = [
    "/*",
    Array<[undefined, ast.SourceCharacter]>,
    "*/",
  ];
  export type MultiLineCommentNoLineTerminator = [
    "/*",
    Array<[undefined, ast.SourceCharacter]>,
    "*/",
  ];
  export type SingleLineComment = [
    "//",
    Array<[undefined, ast.SourceCharacter]>,
  ];
  export type Identifier = ast.IdentifierName;
  export type IdentifierName = ReturnType<typeof peg$type$action41>;
  export type IdentifierStart =
    | ast.UnicodeLetter
    | "$"
    | "_"
    | ReturnType<typeof peg$type$action42>;
  export type IdentifierPart =
    | ast.IdentifierStart
    | ast.UnicodeCombiningMark
    | ast.UnicodeDigit
    | ast.UnicodeConnectorPunctuation
    | "\u200c"
    | "\u200d";
  export type UnicodeLetter =
    | ast.Lu
    | ast.Ll
    | ast.Lt
    | ast.Lm
    | ast.Lo
    | ast.Nl;
  export type UnicodeCombiningMark = ast.Mn | ast.Mc;
  export type UnicodeDigit = ast.Nd;
  export type UnicodeConnectorPunctuation = ast.Pc;
  export type ReservedWord =
    | ast.Keyword
    | ast.FutureReservedWord
    | ast.NullLiteral
    | ast.BooleanLiteral;
  export type Keyword =
    | ast.BreakToken
    | ast.CaseToken
    | ast.CatchToken
    | ast.ContinueToken
    | ast.DebuggerToken
    | ast.DefaultToken
    | ast.DeleteToken
    | ast.DoToken
    | ast.ElseToken
    | ast.FinallyToken
    | ast.ForToken
    | ast.FunctionToken
    | ast.IfToken
    | ast.InstanceofToken
    | ast.InToken
    | ast.NewToken
    | ast.ReturnToken
    | ast.SwitchToken
    | ast.ThisToken
    | ast.ThrowToken
    | ast.TryToken
    | ast.TypeofToken
    | ast.VarToken
    | ast.VoidToken
    | ast.WhileToken
    | ast.WithToken;
  export type FutureReservedWord =
    | ast.ClassToken
    | ast.ConstToken
    | ast.EnumToken
    | ast.ExportToken
    | ast.ExtendsToken
    | ast.ImportToken
    | ast.SuperToken;
  export type NullLiteral = ast.NullToken;
  export type BooleanLiteral = ast.TrueToken | ast.FalseToken;
  export type Annotation = ReturnType<typeof peg$type$action47>;
  export type AnnotationParameters = ReturnType<typeof peg$type$action62>;
  export type AnnotationParameter =
    | ReturnType<typeof peg$type$action63>
    | ReturnType<typeof peg$type$action64>;
  export type LiteralMatcher = ReturnType<typeof peg$type$action65>;
  export type ValueLiteral =
    | ast.StringLiteral
    | ast.ArrayLiteral
    | ReturnType<typeof peg$type$action66>
    | ReturnType<typeof peg$type$action67>;
  export type ArrayLiteral = ReturnType<typeof peg$type$action68>;
  export type ArrayValues = ReturnType<typeof peg$type$action75>;
  export type StringLiteral =
    | ReturnType<typeof peg$type$action76>
    | ReturnType<typeof peg$type$action77>
    | ReturnType<typeof peg$type$action78>;
  export type BacktickStringCharacter =
    | ReturnType<typeof peg$type$action79>
    | ReturnType<typeof peg$type$action80>
    | ast.LineContinuation;
  export type DoubleStringCharacter =
    | ReturnType<typeof peg$type$action81>
    | ReturnType<typeof peg$type$action82>
    | ast.LineContinuation;
  export type SingleStringCharacter =
    | ReturnType<typeof peg$type$action83>
    | ReturnType<typeof peg$type$action84>
    | ast.LineContinuation;
  export type CharacterClassMatcher = ReturnType<typeof peg$type$action85>;
  export type ClassCharacterRange = ReturnType<typeof peg$type$action86>;
  export type ClassCharacter =
    | ReturnType<typeof peg$type$action87>
    | ReturnType<typeof peg$type$action88>
    | ast.LineContinuation;
  export type LineContinuation = ReturnType<typeof peg$type$action89>;
  export type EscapeSequence =
    | ast.CharacterEscapeSequence
    | ReturnType<typeof peg$type$action90>
    | ast.HexEscapeSequence
    | ast.UnicodeEscapeSequence;
  export type CharacterEscapeSequence =
    | ast.SingleEscapeCharacter
    | ast.NonEscapeCharacter;
  export type SingleEscapeCharacter =
    | string
    | ReturnType<typeof peg$type$action91>
    | ReturnType<typeof peg$type$action92>
    | ReturnType<typeof peg$type$action93>
    | ReturnType<typeof peg$type$action94>
    | ReturnType<typeof peg$type$action95>
    | ReturnType<typeof peg$type$action96>;
  export type NonEscapeCharacter = ReturnType<typeof peg$type$action97>;
  export type EscapeCharacter =
    | ast.SingleEscapeCharacter
    | ast.DecimalDigit
    | "x"
    | "u";
  export type HexEscapeSequence = ReturnType<typeof peg$type$action98>;
  export type UnicodeEscapeSequence = ReturnType<typeof peg$type$action99>;
  export type DecimalDigit = string;
  export type HexDigit = string;
  export type AnyMatcher = ReturnType<typeof peg$type$action100>;
  export type CodeBlock = ReturnType<typeof peg$type$action101>;
  export type Code = string;
  export type Ll = string;
  export type Lm = string;
  export type Lo = string;
  export type Lt = string;
  export type Lu = string;
  export type Mc = string;
  export type Mn = string;
  export type Nd = string;
  export type Nl = string;
  export type Pc = string;
  export type Zs = string;
  export type BreakToken = ["break", undefined];
  export type CaseToken = ["case", undefined];
  export type CatchToken = ["catch", undefined];
  export type ClassToken = ["class", undefined];
  export type ConstToken = ["const", undefined];
  export type ContinueToken = ["continue", undefined];
  export type DebuggerToken = ["debugger", undefined];
  export type DefaultToken = ["default", undefined];
  export type DeleteToken = ["delete", undefined];
  export type DoToken = ["do", undefined];
  export type ElseToken = ["else", undefined];
  export type EnumToken = ["enum", undefined];
  export type ExportToken = ["export", undefined];
  export type ExtendsToken = ["extends", undefined];
  export type FalseToken = ["false", undefined];
  export type FinallyToken = ["finally", undefined];
  export type ForToken = ["for", undefined];
  export type FunctionToken = ["function", undefined];
  export type IfToken = ["if", undefined];
  export type ImportToken = ["import", undefined];
  export type InstanceofToken = ["instanceof", undefined];
  export type InToken = ["in", undefined];
  export type NewToken = ["new", undefined];
  export type NullToken = ["null", undefined];
  export type ReturnToken = ["return", undefined];
  export type SuperToken = ["super", undefined];
  export type SwitchToken = ["switch", undefined];
  export type ThisToken = ["this", undefined];
  export type ThrowToken = ["throw", undefined];
  export type TrueToken = ["true", undefined];
  export type TryToken = ["try", undefined];
  export type TypeofToken = ["typeof", undefined];
  export type VarToken = ["var", undefined];
  export type VoidToken = ["void", undefined];
  export type WhileToken = ["while", undefined];
  export type WithToken = ["with", undefined];
  export type Unknown = Array<
    ast.WhiteSpace | ast.LineTerminatorSequence | ast.Comment
  >;
  export type Unknown1 = Array<
    ast.WhiteSpace | ast.MultiLineCommentNoLineTerminator
  >;
  export type Eos =
    | [ast.Unknown, ";"]
    | [ast.Unknown1, ast.SingleLineComment | null, ast.LineTerminatorSequence]
    | [ast.Unknown, ast.Eof];
  export type Eof = undefined;
}

declare type ParseResults = {
  Grammar: ast.Grammar;
  Initializer: ast.Initializer;
  Rule: ast.Rule;
  Expression: ast.Expression;
  LeadingChoiceExpression: ast.LeadingChoiceExpression;
  ChoiceExpression: ast.ChoiceExpression;
  ScopeExpression: ast.ScopeExpression;
  ActionExpression: ast.ActionExpression;
  SequenceExpression: ast.SequenceExpression;
  LabeledExpression: ast.LabeledExpression;
  PrefixedExpression: ast.PrefixedExpression;
  PrefixedOperator: ast.PrefixedOperator;
  SuffixedExpression: ast.SuffixedExpression;
  SuffixedOperator: ast.SuffixedOperator;
  PrimaryExpression: ast.PrimaryExpression;
  RuleReferenceExpression: ast.RuleReferenceExpression;
  SemanticPredicateExpression: ast.SemanticPredicateExpression;
  SemanticPredicateOperator: ast.SemanticPredicateOperator;
  SourceCharacter: ast.SourceCharacter;
  WhiteSpace: ast.WhiteSpace;
  LineTerminator: ast.LineTerminator;
  LineTerminatorSequence: ast.LineTerminatorSequence;
  Comment: ast.Comment;
  MultiLineComment: ast.MultiLineComment;
  MultiLineCommentNoLineTerminator: ast.MultiLineCommentNoLineTerminator;
  SingleLineComment: ast.SingleLineComment;
  Identifier: ast.Identifier;
  IdentifierName: ast.IdentifierName;
  IdentifierStart: ast.IdentifierStart;
  IdentifierPart: ast.IdentifierPart;
  UnicodeLetter: ast.UnicodeLetter;
  UnicodeCombiningMark: ast.UnicodeCombiningMark;
  UnicodeDigit: ast.UnicodeDigit;
  UnicodeConnectorPunctuation: ast.UnicodeConnectorPunctuation;
  ReservedWord: ast.ReservedWord;
  Keyword: ast.Keyword;
  FutureReservedWord: ast.FutureReservedWord;
  NullLiteral: ast.NullLiteral;
  BooleanLiteral: ast.BooleanLiteral;
  Annotation: ast.Annotation;
  AnnotationParameters: ast.AnnotationParameters;
  AnnotationParameter: ast.AnnotationParameter;
  LiteralMatcher: ast.LiteralMatcher;
  ValueLiteral: ast.ValueLiteral;
  ArrayLiteral: ast.ArrayLiteral;
  ArrayValues: ast.ArrayValues;
  StringLiteral: ast.StringLiteral;
  BacktickStringCharacter: ast.BacktickStringCharacter;
  DoubleStringCharacter: ast.DoubleStringCharacter;
  SingleStringCharacter: ast.SingleStringCharacter;
  CharacterClassMatcher: ast.CharacterClassMatcher;
  ClassCharacterRange: ast.ClassCharacterRange;
  ClassCharacter: ast.ClassCharacter;
  LineContinuation: ast.LineContinuation;
  EscapeSequence: ast.EscapeSequence;
  CharacterEscapeSequence: ast.CharacterEscapeSequence;
  SingleEscapeCharacter: ast.SingleEscapeCharacter;
  NonEscapeCharacter: ast.NonEscapeCharacter;
  EscapeCharacter: ast.EscapeCharacter;
  HexEscapeSequence: ast.HexEscapeSequence;
  UnicodeEscapeSequence: ast.UnicodeEscapeSequence;
  DecimalDigit: ast.DecimalDigit;
  HexDigit: ast.HexDigit;
  AnyMatcher: ast.AnyMatcher;
  CodeBlock: ast.CodeBlock;
  Code: ast.Code;
  Ll: ast.Ll;
  Lm: ast.Lm;
  Lo: ast.Lo;
  Lt: ast.Lt;
  Lu: ast.Lu;
  Mc: ast.Mc;
  Mn: ast.Mn;
  Nd: ast.Nd;
  Nl: ast.Nl;
  Pc: ast.Pc;
  Zs: ast.Zs;
  BreakToken: ast.BreakToken;
  CaseToken: ast.CaseToken;
  CatchToken: ast.CatchToken;
  ClassToken: ast.ClassToken;
  ConstToken: ast.ConstToken;
  ContinueToken: ast.ContinueToken;
  DebuggerToken: ast.DebuggerToken;
  DefaultToken: ast.DefaultToken;
  DeleteToken: ast.DeleteToken;
  DoToken: ast.DoToken;
  ElseToken: ast.ElseToken;
  EnumToken: ast.EnumToken;
  ExportToken: ast.ExportToken;
  ExtendsToken: ast.ExtendsToken;
  FalseToken: ast.FalseToken;
  FinallyToken: ast.FinallyToken;
  ForToken: ast.ForToken;
  FunctionToken: ast.FunctionToken;
  IfToken: ast.IfToken;
  ImportToken: ast.ImportToken;
  InstanceofToken: ast.InstanceofToken;
  InToken: ast.InToken;
  NewToken: ast.NewToken;
  NullToken: ast.NullToken;
  ReturnToken: ast.ReturnToken;
  SuperToken: ast.SuperToken;
  SwitchToken: ast.SwitchToken;
  ThisToken: ast.ThisToken;
  ThrowToken: ast.ThrowToken;
  TrueToken: ast.TrueToken;
  TryToken: ast.TryToken;
  TypeofToken: ast.TypeofToken;
  VarToken: ast.VarToken;
  VoidToken: ast.VoidToken;
  WhileToken: ast.WhileToken;
  WithToken: ast.WithToken;
  Unknown: ast.Unknown;
  Unknown1: ast.Unknown1;
  Eos: ast.Eos;
  Eof: ast.Eof;
};

declare function cast<T>(value: any, fn: () => T): T;
declare function literal<const T>(val: T): T;
declare function tuple<T extends any[]>(val: [...T]): [...T];
declare function groupBy<T extends Record<string, any>, TProp extends keyof T>(
  vals: T[],
  prop: TProp,
): { [K in T[TProp]]?: Array<Extract<T, { [_ in TProp]: K }>> };
declare function notEmpty<T>(value: T | null | undefined): value is T;
declare function error(message: string, location?: PegJSLocation): never;
declare function expected(description: string, location?: PegJSLocation): never;
declare function onRollback(fn: () => void): void;
declare function location(): PegJSLocation;
declare function text(): string;

type ParseResult = ast.Grammar;
declare const parse: (data: string) => ParseResult;

export { PegJSLocation, PegJSPosition, ParseResults, ParseResult, ast, parse };

// Only meant to make it easier to debug the grammar types
declare const val: ParseResult;
val;
