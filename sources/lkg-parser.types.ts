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
  [`$`]: `text` as const,
  [`&`]: `simpleAnd` as const,
  [`!`]: `simpleNot` as const,
};

const OPS_TO_SUFFIXED_TYPES = {
  [`?`]: `optional` as const,
  [`*`]: `zeroOrMore` as const,
  [`+`]: `oneOrMore` as const,
};

const OPS_TO_SEMANTIC_PREDICATE_TYPES = {
  [`&`]: `semanticAnd` as const,
  [`!`]: `semanticNot` as const,
};

const peg$type$action0 = (
  initializer: ast.Initializer | null,
  rules: Array<ast.Rule>,
) => {
  {
    return {
      type: `grammar` as const,
      location: location(),
      initializer,
      rules,
    };
  }
};
const peg$type$action1 = (code: ast.CodeBlock) => {
  {
    return {
      type: `initializer` as const,
      location: location(),
      code: code,
    };
  }
};
const peg$type$action2 = (value: ast.Annotation) => {
  return value;
};
const peg$type$action3 = (value: ast.Annotation) => {
  return value;
};
const peg$type$action4 = (
  head: ast.Annotation,
  tail: Array<ReturnType<typeof peg$type$action2>>,
) => {
  return [head, ...tail];
};
const peg$type$action5 = (value: ast.Annotation) => {
  return value;
};
const peg$type$action6 = (value: ast.Annotation) => {
  return value;
};
const peg$type$action7 = (
  head: ast.Annotation,
  tail: Array<ReturnType<typeof peg$type$action5>>,
) => {
  return [head, ...tail];
};
const peg$type$action8 = (
  value: ReturnType<typeof peg$type$action4> | null,
) => {
  return value ?? [];
};
const peg$type$action9 = (value: ast.Annotation) => {
  return value;
};
const peg$type$action10 = (value: ast.Annotation) => {
  return value;
};
const peg$type$action11 = (
  head: ast.Annotation,
  tail: Array<ReturnType<typeof peg$type$action9>>,
) => {
  return [head, ...tail];
};
const peg$type$action12 = (value: ast.Annotation) => {
  return value;
};
const peg$type$action13 = (value: ast.Annotation) => {
  return value;
};
const peg$type$action14 = (
  head: ast.Annotation,
  tail: Array<ReturnType<typeof peg$type$action12>>,
) => {
  return [head, ...tail];
};
const peg$type$action15 = (
  value: ReturnType<typeof peg$type$action11> | null,
) => {
  return value ?? [];
};
const peg$type$action16 = (
  annotations: ReturnType<typeof peg$type$action8>,
  name: ast.IdentifierName,
  displayName: ast.StringLiteral | null,
  expression: ast.Expression,
) => {
  const expressionWithAnnotations =
    annotations.length === 0
      ? expression
      : {
          ...expression,
          annotations,
        };

  return {
    type: `rule` as const,
    location: location(),
    name,
    expression:
      displayName === null
        ? expressionWithAnnotations
        : {
            type: `named` as const,
            location: location(),
            name: displayName,
            expression: expressionWithAnnotations,
          },
  };
};
const peg$type$action17 = (value: ast.AnnotatedScopeExpression) => {
  return value;
};
const peg$type$action18 = (value: ast.AnnotatedScopeExpression) => {
  return value;
};
const peg$type$action19 = (
  head: ast.AnnotatedScopeExpression,
  tail: Array<ReturnType<typeof peg$type$action17>>,
) => {
  return [head, ...tail];
};
const peg$type$action20 = (value: ast.AnnotatedScopeExpression) => {
  return value;
};
const peg$type$action21 = (value: ast.AnnotatedScopeExpression) => {
  return value;
};
const peg$type$action22 = (
  head: ast.AnnotatedScopeExpression,
  tail: Array<ReturnType<typeof peg$type$action20>>,
) => {
  return [head, ...tail];
};
const peg$type$action23 = (
  alternatives: ReturnType<typeof peg$type$action19>,
) => {
  return alternatives.length === 1
    ? alternatives[0]
    : {
        type: `choice` as const,
        location: location(),
        alternatives,
      };
};
const peg$type$action24 = (value: ast.Annotation) => {
  return value;
};
const peg$type$action25 = (value: ast.Annotation) => {
  return value;
};
const peg$type$action26 = (
  head: ast.Annotation,
  tail: Array<ReturnType<typeof peg$type$action24>>,
) => {
  return [head, ...tail];
};
const peg$type$action27 = (value: ast.Annotation) => {
  return value;
};
const peg$type$action28 = (value: ast.Annotation) => {
  return value;
};
const peg$type$action29 = (
  head: ast.Annotation,
  tail: Array<ReturnType<typeof peg$type$action27>>,
) => {
  return [head, ...tail];
};
const peg$type$action30 = (
  value: ReturnType<typeof peg$type$action26> | null,
) => {
  return value ?? [];
};
const peg$type$action31 = (value: ast.Annotation) => {
  return value;
};
const peg$type$action32 = (value: ast.Annotation) => {
  return value;
};
const peg$type$action33 = (
  head: ast.Annotation,
  tail: Array<ReturnType<typeof peg$type$action31>>,
) => {
  return [head, ...tail];
};
const peg$type$action34 = (value: ast.Annotation) => {
  return value;
};
const peg$type$action35 = (value: ast.Annotation) => {
  return value;
};
const peg$type$action36 = (
  head: ast.Annotation,
  tail: Array<ReturnType<typeof peg$type$action34>>,
) => {
  return [head, ...tail];
};
const peg$type$action37 = (
  value: ReturnType<typeof peg$type$action33> | null,
) => {
  return value ?? [];
};
const peg$type$action38 = (
  annotations: ReturnType<typeof peg$type$action30>,
  expression: ast.ScopeExpression,
) => {
  return annotations.length === 0
    ? expression
    : {
        ...expression,
        annotations,
      };
};
const peg$type$action39 = (
  expression: ast.ActionExpression,
  code: ast.CodeBlock,
) => {
  {
    return {
      type: `scope` as const,
      location: location(),
      code,
      expression,
    };
  }
};
const peg$type$action40 = (
  expression: ast.SequenceExpression,
  code: ast.CodeBlock,
) => {
  {
    return {
      type: `action` as const,
      location: location(),
      code: code ?? ``,
      expression,
    };
  }
};
const peg$type$action41 = (value: ast.LabeledExpression) => {
  return value;
};
const peg$type$action42 = (value: ast.LabeledExpression) => {
  return value;
};
const peg$type$action43 = (
  head: ast.LabeledExpression,
  tail: Array<ReturnType<typeof peg$type$action41>>,
) => {
  return [head, ...tail];
};
const peg$type$action44 = (value: ast.LabeledExpression) => {
  return value;
};
const peg$type$action45 = (value: ast.LabeledExpression) => {
  return value;
};
const peg$type$action46 = (
  head: ast.LabeledExpression,
  tail: Array<ReturnType<typeof peg$type$action44>>,
) => {
  return [head, ...tail];
};
const peg$type$action47 = (elements: ReturnType<typeof peg$type$action43>) => {
  return elements.length === 1
    ? elements[0]
    : {
        type: `sequence` as const,
        location: location(),
        elements,
      };
};
const peg$type$action48 = (
  label: ast.Identifier,
  expression: ast.PrefixedExpression,
) => {
  {
    return {
      type: `labeled` as const,
      location: location(),
      label,
      expression,
    };
  }
};
const peg$type$action49 = (expression: ast.PrefixedExpression) => {
  {
    return {
      type: `labeled` as const,
      location: location(),
      label: null,
      expression,
    };
  }
};
const peg$type$action50 = (
  operator: ast.PrefixedOperator,
  expression: ast.SuffixedExpression,
) => {
  {
    return {
      type: OPS_TO_PREFIXED_TYPES[operator],
      location: location(),
      expression,
    };
  }
};
const peg$type$action51 = (
  expression: ast.PrimaryExpression,
  operator: ast.SuffixedOperator,
) => {
  {
    return {
      type: OPS_TO_SUFFIXED_TYPES[operator],
      location: location(),
      expression,
    };
  }
};
const peg$type$action52 = (name: ast.IdentifierName) => {
  {
    return {
      type: `ruleRef` as const,
      location: location(),
      name,
    };
  }
};
const peg$type$action53 = (
  operator: ast.SemanticPredicateOperator,
  code: ast.CodeBlock,
) => {
  {
    return {
      type: OPS_TO_SEMANTIC_PREDICATE_TYPES[operator],
      location: location(),
      code,
    };
  }
};
const peg$type$action54 = (
  head: ast.IdentifierStart | "$",
  tail: Array<ast.IdentifierPart>,
) => {
  {
    return head + tail.join(``);
  }
};
const peg$type$action55 = (
  head: ast.IdentifierStart,
  tail: Array<ast.IdentifierPart>,
) => {
  {
    return head + tail.join(``);
  }
};
const peg$type$action56 = (conditions: Array<ast.Identifier>) => {
  {
    return {
      name: `if`,
      parameters: { conditions },
    };
  }
};
const peg$type$action57 = (expr: unknown) => {
  {
    return {
      name: `separator`,
      parameters: { expr },
    };
  }
};
const peg$type$action58 = (type: ast.StringLiteral) => {
  {
    return {
      name: `type`,
      parameters: { type },
    };
  }
};
const peg$type$action59 = (parameters: ast.AnnotationParameters | null) => {
  {
    return {
      name: `token`,
      parameters: parameters ?? {},
    };
  }
};
const peg$type$action60 = (value: ast.AnnotationParameter) => {
  return value;
};
const peg$type$action61 = (value: ast.AnnotationParameter) => {
  return value;
};
const peg$type$action62 = (
  head: ast.AnnotationParameter,
  tail: Array<ReturnType<typeof peg$type$action60>>,
) => {
  return [head, ...tail];
};
const peg$type$action63 = (value: ast.AnnotationParameter) => {
  return value;
};
const peg$type$action64 = (value: ast.AnnotationParameter) => {
  return value;
};
const peg$type$action65 = (
  head: ast.AnnotationParameter,
  tail: Array<ReturnType<typeof peg$type$action63>>,
) => {
  return [head, ...tail];
};
const peg$type$action66 = (
  value: ReturnType<typeof peg$type$action62> | null,
) => {
  return value ?? [];
};
const peg$type$action67 = (value: ast.AnnotationParameter) => {
  return value;
};
const peg$type$action68 = (value: ast.AnnotationParameter) => {
  return value;
};
const peg$type$action69 = (
  head: ast.AnnotationParameter,
  tail: Array<ReturnType<typeof peg$type$action67>>,
) => {
  return [head, ...tail];
};
const peg$type$action70 = (value: ast.AnnotationParameter) => {
  return value;
};
const peg$type$action71 = (value: ast.AnnotationParameter) => {
  return value;
};
const peg$type$action72 = (
  head: ast.AnnotationParameter,
  tail: Array<ReturnType<typeof peg$type$action70>>,
) => {
  return [head, ...tail];
};
const peg$type$action73 = (
  value: ReturnType<typeof peg$type$action69> | null,
) => {
  return value ?? [];
};
const peg$type$action74 = (
  parameterList: ReturnType<typeof peg$type$action66>,
) => {
  return Object.fromEntries(parameterList);
};
const peg$type$action75 = (name: ast.Identifier, value: ast.ValueLiteral) => {
  return tuple([name, value]);
};
const peg$type$action76 = (
  value: ast.StringLiteral,
  ignoreCase: "i" | null,
) => {
  {
    return {
      type: `literal` as const,
      location: location(),
      ignoreCase: ignoreCase !== null,
      value,
    };
  }
};
const peg$type$action77 = () => {
  {
    return JSON.parse(text());
  }
};
const peg$type$action78 = () => {
  {
    return null;
  }
};
const peg$type$action79 = (values: ast.ArrayValues | null) => {
  {
    return values ?? [];
  }
};
const peg$type$action80 = (value: ast.ValueLiteral) => {
  return value;
};
const peg$type$action81 = (value: ast.ValueLiteral) => {
  return value;
};
const peg$type$action82 = (
  head: ast.ValueLiteral,
  tail: Array<ReturnType<typeof peg$type$action80>>,
) => {
  return [head, ...tail];
};
const peg$type$action83 = (value: ast.ValueLiteral) => {
  return value;
};
const peg$type$action84 = (value: ast.ValueLiteral) => {
  return value;
};
const peg$type$action85 = (
  head: ast.ValueLiteral,
  tail: Array<ReturnType<typeof peg$type$action83>>,
) => {
  return [head, ...tail];
};
const peg$type$action86 = (
  value: ReturnType<typeof peg$type$action82> | null,
) => {
  return value ?? [];
};
const peg$type$action87 = (chars: Array<ast.BacktickStringCharacter>) => {
  {
    return chars.join(``);
  }
};
const peg$type$action88 = (chars: Array<ast.DoubleStringCharacter>) => {
  {
    return chars.join(``);
  }
};
const peg$type$action89 = (chars: Array<ast.SingleStringCharacter>) => {
  {
    return chars.join(``);
  }
};
const peg$type$action90 = () => {
  {
    return text();
  }
};
const peg$type$action91 = (sequence: ast.EscapeSequence) => {
  {
    return sequence;
  }
};
const peg$type$action92 = () => {
  {
    return text();
  }
};
const peg$type$action93 = (sequence: ast.EscapeSequence) => {
  {
    return sequence;
  }
};
const peg$type$action94 = () => {
  {
    return text();
  }
};
const peg$type$action95 = (sequence: ast.EscapeSequence) => {
  {
    return sequence;
  }
};
const peg$type$action96 = (
  inverted: "^" | null,
  parts: Array<ast.ClassCharacterRange | ast.ClassCharacter>,
  ignoreCase: "i" | null,
) => {
  {
    return {
      type: `class` as const,
      location: location(),
      parts: parts.filter((part) => part !== ``),
      inverted: inverted !== null,
      ignoreCase: ignoreCase !== null,
    };
  }
};
const peg$type$action97 = (
  begin: ast.ClassCharacter,
  end: ast.ClassCharacter,
) => {
  if (begin.charCodeAt(0) > end.charCodeAt(0))
    error(`Invalid character range: ${text()}.`);

  return tuple([begin, end]);
};
const peg$type$action98 = () => {
  {
    return text();
  }
};
const peg$type$action99 = (sequence: ast.EscapeSequence) => {
  {
    return sequence;
  }
};
const peg$type$action100 = () => {
  {
    return ``;
  }
};
const peg$type$action101 = () => {
  {
    return `\0`;
  }
};
const peg$type$action102 = () => {
  {
    return `\b`;
  }
};
const peg$type$action103 = () => {
  {
    return `\f`;
  }
};
const peg$type$action104 = () => {
  {
    return `\n`;
  }
};
const peg$type$action105 = () => {
  {
    return `\r`;
  }
};
const peg$type$action106 = () => {
  {
    return `\t`;
  }
};
const peg$type$action107 = () => {
  {
    return `\v`;
  }
};
const peg$type$action108 = () => {
  {
    return text();
  }
};
const peg$type$action109 = (digits: string) => {
  return String.fromCharCode(parseInt(digits, 16));
};
const peg$type$action110 = (digits: string) => {
  return String.fromCharCode(parseInt(digits, 16));
};
const peg$type$action111 = () => {
  {
    return {
      type: `any` as const,
      location: location(),
    };
  }
};
const peg$type$action112 = () => {
  {
    return {
      type: `end` as const,
      location: location(),
    };
  }
};
const peg$type$action113 = (code: ast.CodeBraces) => {
  {
    return code;
  }
};
const peg$type$action114 = (code: ast.CodeParen) => {
  {
    return `{ return (${code}) }`;
  }
};

namespace ast {
  export type Grammar = ReturnType<typeof peg$type$action0>;
  export type Initializer = ReturnType<typeof peg$type$action1>;
  export type Rule = ReturnType<typeof peg$type$action16>;
  export type Expression = ast.LeadingChoiceExpression;
  export type LeadingChoiceExpression = ast.ChoiceExpression;
  export type ChoiceExpression = ReturnType<typeof peg$type$action23>;
  export type AnnotatedScopeExpression = ReturnType<typeof peg$type$action38>;
  export type ScopeExpression =
    | ReturnType<typeof peg$type$action39>
    | ast.ActionExpression;
  export type ActionExpression =
    | ReturnType<typeof peg$type$action40>
    | ast.SequenceExpression;
  export type SequenceExpression = ReturnType<typeof peg$type$action47>;
  export type LabeledExpression =
    | ReturnType<typeof peg$type$action48>
    | ReturnType<typeof peg$type$action49>
    | ast.PrefixedExpression;
  export type PrefixedExpression =
    | ReturnType<typeof peg$type$action50>
    | ast.SuffixedExpression;
  export type PrefixedOperator = "$" | "&" | "!";
  export type SuffixedExpression =
    | ReturnType<typeof peg$type$action51>
    | ast.PrimaryExpression;
  export type SuffixedOperator = "?" | "*" | "+";
  export type PrimaryExpression =
    | ast.LiteralMatcher
    | ast.CharacterClassMatcher
    | ast.AnyMatcher
    | ast.EndMatcher
    | ast.RuleReferenceExpression
    | ast.SemanticPredicateExpression
    | never;
  export type RuleReferenceExpression = ReturnType<typeof peg$type$action52>;
  export type SemanticPredicateExpression = ReturnType<
    typeof peg$type$action53
  >;
  export type SemanticPredicateOperator = "&" | "!";
  export type SourceCharacter = string;
  export type WhiteSpace = string;
  export type LineTerminator = string;
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
  export type IdentifierName =
    | ReturnType<typeof peg$type$action54>
    | ReturnType<typeof peg$type$action55>;
  export type IdentifierStart =
    | ast.UnicodeLetter
    | "_"
    | ast.UnicodeEscapeSequence;
  export type IdentifierPart =
    | ast.IdentifierStart
    | ast.UnicodeCombiningMark
    | ast.UnicodeDigit
    | ast.UnicodeConnectorPunctuation
    | "$"
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
  export type Annotation =
    | ast.IfAnnotation
    | ast.SeparatorAnnotation
    | ast.TokenAnnotation
    | ast.TypeAnnotation;
  export type IfAnnotation = ReturnType<typeof peg$type$action56>;
  export type SeparatorAnnotation = ReturnType<typeof peg$type$action57>;
  export type TypeAnnotation = ReturnType<typeof peg$type$action58>;
  export type TokenAnnotation = ReturnType<typeof peg$type$action59>;
  export type AnnotationParameters = ReturnType<typeof peg$type$action74>;
  export type AnnotationParameter = ReturnType<typeof peg$type$action75>;
  export type LiteralMatcher = ReturnType<typeof peg$type$action76>;
  export type ValueLiteral =
    | ast.StringLiteral
    | unknown
    | ReturnType<typeof peg$type$action77>
    | ReturnType<typeof peg$type$action78>;
  export type ArrayLiteral = ReturnType<typeof peg$type$action79>;
  export type ArrayValues = ReturnType<typeof peg$type$action86>;
  export type StringLiteral =
    | ReturnType<typeof peg$type$action87>
    | ReturnType<typeof peg$type$action88>
    | ReturnType<typeof peg$type$action89>;
  export type BacktickStringCharacter =
    | ReturnType<typeof peg$type$action90>
    | ReturnType<typeof peg$type$action91>
    | ast.LineContinuation;
  export type DoubleStringCharacter =
    | ReturnType<typeof peg$type$action92>
    | ReturnType<typeof peg$type$action93>
    | ast.LineContinuation;
  export type SingleStringCharacter =
    | ReturnType<typeof peg$type$action94>
    | ReturnType<typeof peg$type$action95>
    | ast.LineContinuation;
  export type CharacterClassMatcher = ReturnType<typeof peg$type$action96>;
  export type ClassCharacterRange = ReturnType<typeof peg$type$action97>;
  export type ClassCharacter =
    | ReturnType<typeof peg$type$action98>
    | ReturnType<typeof peg$type$action99>
    | ast.LineContinuation;
  export type LineContinuation = ReturnType<typeof peg$type$action100>;
  export type EscapeSequence =
    | ast.CharacterEscapeSequence
    | ReturnType<typeof peg$type$action101>
    | ast.HexEscapeSequence
    | ast.UnicodeEscapeSequence;
  export type CharacterEscapeSequence =
    | ast.SingleEscapeCharacter
    | ast.NonEscapeCharacter;
  export type SingleEscapeCharacter =
    | string
    | ReturnType<typeof peg$type$action102>
    | ReturnType<typeof peg$type$action103>
    | ReturnType<typeof peg$type$action104>
    | ReturnType<typeof peg$type$action105>
    | ReturnType<typeof peg$type$action106>
    | ReturnType<typeof peg$type$action107>;
  export type NonEscapeCharacter = ReturnType<typeof peg$type$action108>;
  export type EscapeCharacter =
    | ast.SingleEscapeCharacter
    | ast.DecimalDigit
    | "x"
    | "u";
  export type HexEscapeSequence = ReturnType<typeof peg$type$action109>;
  export type UnicodeEscapeSequence = ReturnType<typeof peg$type$action110>;
  export type DecimalDigit = string;
  export type HexDigit = string;
  export type AnyMatcher = ReturnType<typeof peg$type$action111>;
  export type EndMatcher = ReturnType<typeof peg$type$action112>;
  export type CodeBlock =
    | ReturnType<typeof peg$type$action113>
    | ReturnType<typeof peg$type$action114>;
  export type CodeBraces = string;
  export type CodeParen = string;
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
  export type Unknown = Array<string | ast.Comment>;
  export type Unknown1 = Array<
    ast.WhiteSpace | ast.MultiLineCommentNoLineTerminator
  >;
  export type Eos =
    | [ast.Unknown, ";"]
    | [ast.Unknown1, ast.SingleLineComment | null, ast.LineTerminator]
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
  AnnotatedScopeExpression: ast.AnnotatedScopeExpression;
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
  IfAnnotation: ast.IfAnnotation;
  SeparatorAnnotation: ast.SeparatorAnnotation;
  TypeAnnotation: ast.TypeAnnotation;
  TokenAnnotation: ast.TokenAnnotation;
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
  EndMatcher: ast.EndMatcher;
  CodeBlock: ast.CodeBlock;
  CodeBraces: ast.CodeBraces;
  CodeParen: ast.CodeParen;
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

declare function tuple<T extends any[]>(val: [...T]): [...T];
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
