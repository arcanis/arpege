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
      if (array[i] !== ``)
        result.push(array[i]);

    return result;
  }

const peg$type$action0 = (initializer: ((InitializerType) | null), rules: Array<(RuleType)>) => {
      return {
        type: literal(`grammar`),
        location: location(),
        initializer,
        rules,
      };
    };
const peg$type$action1 = (code: CodeBlockType) => {
      return {
        type: literal(`initializer`),
        location: location(),
        code: code,
      };
    };
const peg$type$action2 = (name: IdentifierNameType, displayName: ((StringLiteralType) | null), expression: ExpressionType) => {
      return {
        type: literal(`rule`),
        location: location(),
        name,
        expression: displayName === null ? expression : {
          type: literal(`named`),
          location: location(),
          name: displayName,
          expression,
        },
      };
    };
const peg$type$action3 = (value: AnnotationType) => {return value};
const peg$type$action4 = (value: AnnotationType) => {return value};
const peg$type$action5 = (head: AnnotationType, tail: Array<ReturnType<typeof peg$type$action3>>) => {return [head, ...tail]};
const peg$type$action6 = (value: AnnotationType) => {return value};
const peg$type$action7 = (value: AnnotationType) => {return value};
const peg$type$action8 = (head: AnnotationType, tail: Array<ReturnType<typeof peg$type$action6>>) => {return [head, ...tail]};
const peg$type$action9 = (value: (ReturnType<typeof peg$type$action5> | null)) => {return value ?? []};
const peg$type$action10 = (value: AnnotationType) => {return value};
const peg$type$action11 = (value: AnnotationType) => {return value};
const peg$type$action12 = (head: AnnotationType, tail: Array<ReturnType<typeof peg$type$action10>>) => {return [head, ...tail]};
const peg$type$action13 = (value: AnnotationType) => {return value};
const peg$type$action14 = (value: AnnotationType) => {return value};
const peg$type$action15 = (head: AnnotationType, tail: Array<ReturnType<typeof peg$type$action13>>) => {return [head, ...tail]};
const peg$type$action16 = (value: (ReturnType<typeof peg$type$action12> | null)) => {return value ?? []};
const peg$type$action17 = (annotations: ReturnType<typeof peg$type$action9>, expression: LeadingChoiceExpressionType) => {
      return {...expression, annotations: annotations.length > 0 ? annotations : undefined};
    };
const peg$type$action18 = (expression: ChoiceExpressionType) => {
      return expression;
    };
const peg$type$action19 = (value: ScopeExpressionType) => {return value};
const peg$type$action20 = (value: ScopeExpressionType) => {return value};
const peg$type$action21 = (head: ScopeExpressionType, tail: Array<ReturnType<typeof peg$type$action19>>) => {return [head, ...tail]};
const peg$type$action22 = (value: ScopeExpressionType) => {return value};
const peg$type$action23 = (value: ScopeExpressionType) => {return value};
const peg$type$action24 = (head: ScopeExpressionType, tail: Array<ReturnType<typeof peg$type$action22>>) => {return [head, ...tail]};
const peg$type$action25 = (alternatives: ReturnType<typeof peg$type$action21>) => {
      return alternatives.length === 1 ? alternatives[0] : {
        type: literal(`choice`),
        location: location(),
        alternatives,
      };
    };
const peg$type$action26 = (expression: ActionExpressionType, code: CodeBlockType) => {
      return {
        type: literal(`scope`),
        location: location(),
        code,
        expression,
      };
    };
const peg$type$action27 = (expression: SequenceExpressionType, code: ((CodeBlockType) | null)) => {
      return code === null ? expression : {
        type: literal(`action`),
        location: location(),
        code: code ?? ``,
        expression,
      };
    };
const peg$type$action28 = (value: LabeledExpressionType) => {return value};
const peg$type$action29 = (value: LabeledExpressionType) => {return value};
const peg$type$action30 = (head: LabeledExpressionType, tail: Array<ReturnType<typeof peg$type$action28>>) => {return [head, ...tail]};
const peg$type$action31 = (value: LabeledExpressionType) => {return value};
const peg$type$action32 = (value: LabeledExpressionType) => {return value};
const peg$type$action33 = (head: LabeledExpressionType, tail: Array<ReturnType<typeof peg$type$action31>>) => {return [head, ...tail]};
const peg$type$action34 = (elements: ReturnType<typeof peg$type$action30>) => {
      return elements.length === 1 ? elements[0] : {
        type: literal(`sequence`),
        location: location(),
        elements,
      };
    };
const peg$type$action35 = (label: IdentifierType, expression: PrefixedExpressionType) => {
      return {
        type: literal(`labeled`),
        location: location(),
        label,
        expression,
      };
    };
const peg$type$action36 = (expression: PrefixedExpressionType) => {
      return {
        type: literal(`labeled`),
        location: location(),
        label: null,
        expression,
      };
    };
const peg$type$action37 = (operator: PrefixedOperatorType, expression: SuffixedExpressionType) => {
      return {
        type: OPS_TO_PREFIXED_TYPES[operator],
        location: location(),
        expression,
      };
    };
const peg$type$action38 = (expression: PrimaryExpressionType, operator: SuffixedOperatorType) => {
      return {
        type: OPS_TO_SUFFIXED_TYPES[operator],
        location: location(),
        expression,
      };
    };
const peg$type$action39 = (name: IdentifierNameType) => {
      return {
        type: literal(`ruleRef`),
        location: location(),
        name,
      };
    };
const peg$type$action40 = (operator: SemanticPredicateOperatorType, code: CodeBlockType) => {
      return {
        type: OPS_TO_SEMANTIC_PREDICATE_TYPES[operator],
        location: location(),
        code,
      };
    };
const peg$type$action41 = (head: IdentifierStartType, tail: Array<IdentifierPartType>) => { return head + tail.join(``); };
const peg$type$action42 = (sequence: UnicodeEscapeSequenceType) => { return sequence; };
const peg$type$action43 = (name: IdentifierType) => { return name };
const peg$type$action44 = (name: IdentifierType) => { return name };
const peg$type$action45 = (parameters: (AnnotationParametersType | null)) => { return parameters };
const peg$type$action46 = (parameters: (AnnotationParametersType | null)) => { return parameters };
const peg$type$action47 = (name: ReturnType<typeof peg$type$action43>, parameters: (ReturnType<typeof peg$type$action45> | null)) => {
      return {
        name,
        parameters: parameters ?? {}
      };
    };
const peg$type$action48 = (value: AnnotationParameterType) => {return value};
const peg$type$action49 = (value: AnnotationParameterType) => {return value};
const peg$type$action50 = (head: AnnotationParameterType, tail: Array<ReturnType<typeof peg$type$action48>>) => {return [head, ...tail]};
const peg$type$action51 = (value: AnnotationParameterType) => {return value};
const peg$type$action52 = (value: AnnotationParameterType) => {return value};
const peg$type$action53 = (head: AnnotationParameterType, tail: Array<ReturnType<typeof peg$type$action51>>) => {return [head, ...tail]};
const peg$type$action54 = (value: (ReturnType<typeof peg$type$action50> | null)) => {return value ?? []};
const peg$type$action55 = (value: AnnotationParameterType) => {return value};
const peg$type$action56 = (value: AnnotationParameterType) => {return value};
const peg$type$action57 = (head: AnnotationParameterType, tail: Array<ReturnType<typeof peg$type$action55>>) => {return [head, ...tail]};
const peg$type$action58 = (value: AnnotationParameterType) => {return value};
const peg$type$action59 = (value: AnnotationParameterType) => {return value};
const peg$type$action60 = (head: AnnotationParameterType, tail: Array<ReturnType<typeof peg$type$action58>>) => {return [head, ...tail]};
const peg$type$action61 = (value: (ReturnType<typeof peg$type$action57> | null)) => {return value ?? []};
const peg$type$action62 = (parameterList: ReturnType<typeof peg$type$action54>) => {
      return Object.fromEntries(parameterList);
    };
const peg$type$action63 = (name: IdentifierType, expression: unknown) => {
      return tuple([name, expression]);
    };
const peg$type$action64 = (name: IdentifierType, value: ValueLiteralType) => {
      return tuple([name, value]);
    };
const peg$type$action65 = (value: StringLiteralType, ignoreCase: ("i" | null)) => {
      return {
        type: literal(`literal`),
        location: location(),
        ignoreCase: ignoreCase !== null,
        value,
      };
    };
const peg$type$action66 = () => { return JSON.parse(text()) };
const peg$type$action67 = () => { return null };
const peg$type$action68 = (values: (ArrayValuesType | null)) => { return values ?? [] };
const peg$type$action69 = (value: ValueLiteralType) => {return value};
const peg$type$action70 = (value: ValueLiteralType) => {return value};
const peg$type$action71 = (head: ValueLiteralType, tail: Array<ReturnType<typeof peg$type$action69>>) => {return [head, ...tail]};
const peg$type$action72 = (value: ValueLiteralType) => {return value};
const peg$type$action73 = (value: ValueLiteralType) => {return value};
const peg$type$action74 = (head: ValueLiteralType, tail: Array<ReturnType<typeof peg$type$action72>>) => {return [head, ...tail]};
const peg$type$action75 = (value: (ReturnType<typeof peg$type$action71> | null)) => {return value ?? []};
const peg$type$action76 = (chars: Array<BacktickStringCharacterType>) => { return chars.join(``) };
const peg$type$action77 = (chars: Array<DoubleStringCharacterType>) => { return chars.join(``) };
const peg$type$action78 = (chars: Array<SingleStringCharacterType>) => { return chars.join(``) };
const peg$type$action79 = () => { return text() };
const peg$type$action80 = (sequence: EscapeSequenceType) => { return sequence };
const peg$type$action81 = () => { return text() };
const peg$type$action82 = (sequence: EscapeSequenceType) => { return sequence };
const peg$type$action83 = () => { return text() };
const peg$type$action84 = (sequence: EscapeSequenceType) => { return sequence };
const peg$type$action85 = (inverted: ("^" | null), parts: Array<ClassCharacterRangeType | ClassCharacterType>, ignoreCase: ("i" | null)) => {
        return {
          type: literal(`class`),
          location: location(),
          parts: filterEmptyStrings(parts),
          inverted: inverted !== null,
          ignoreCase: ignoreCase !== null,
        };
      };
const peg$type$action86 = (begin: ClassCharacterType, end: ClassCharacterType) => {
      if (begin.charCodeAt(0) > end.charCodeAt(0))
        error(`Invalid character range: ${text()}.`);

      return tuple([begin, end]);
    };
const peg$type$action87 = () => { return text() };
const peg$type$action88 = (sequence: EscapeSequenceType) => { return sequence };
const peg$type$action89 = () => { return `` };
const peg$type$action90 = () => { return `\0` };
const peg$type$action91 = () => { return `\b` };
const peg$type$action92 = () => { return `\f` };
const peg$type$action93 = () => { return `\n` };
const peg$type$action94 = () => { return `\r` };
const peg$type$action95 = () => { return `\t` };
const peg$type$action96 = () => { return `\x0B` };
const peg$type$action97 = () => { return text() };
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
const peg$type$action101 = (code: CodeType) => { return code };

type GrammarType = ReturnType<typeof peg$type$action0>;
type InitializerType = ReturnType<typeof peg$type$action1>;
type RuleType = ReturnType<typeof peg$type$action2>;
type ExpressionType = ReturnType<typeof peg$type$action17>;
type LeadingChoiceExpressionType = ReturnType<typeof peg$type$action18>;
type ChoiceExpressionType = ReturnType<typeof peg$type$action25>;
type ScopeExpressionType = ReturnType<typeof peg$type$action26> | ActionExpressionType;
type ActionExpressionType = ReturnType<typeof peg$type$action27>;
type SequenceExpressionType = ReturnType<typeof peg$type$action34>;
type LabeledExpressionType = ReturnType<typeof peg$type$action35> | ReturnType<typeof peg$type$action36> | PrefixedExpressionType;
type PrefixedExpressionType = ReturnType<typeof peg$type$action37> | SuffixedExpressionType;
type PrefixedOperatorType = "$" | "&" | "!";
type SuffixedExpressionType = ReturnType<typeof peg$type$action38> | PrimaryExpressionType;
type SuffixedOperatorType = "?" | "*" | "+";
type PrimaryExpressionType = LiteralMatcherType | CharacterClassMatcherType | AnyMatcherType | RuleReferenceExpressionType | SemanticPredicateExpressionType | never;
type RuleReferenceExpressionType = ReturnType<typeof peg$type$action39>;
type SemanticPredicateExpressionType = ReturnType<typeof peg$type$action40>;
type SemanticPredicateOperatorType = "&" | "!";
type SourceCharacterType = string;
type WhiteSpaceType = "\t" | "\u000b" | "\f" | " " | "\u00a0" | "\ufeff" | ZsType;
type LineTerminatorType = string;
type LineTerminatorSequenceType = "\n" | "\r\n" | "\r" | "\u2028" | "\u2029";
type CommentType = MultiLineCommentType | SingleLineCommentType;
type MultiLineCommentType = ["/*", Array<([undefined, SourceCharacterType])>, "*/"];
type MultiLineCommentNoLineTerminatorType = ["/*", Array<([undefined, SourceCharacterType])>, "*/"];
type SingleLineCommentType = ["//", Array<([undefined, SourceCharacterType])>];
type IdentifierType = IdentifierNameType;
type IdentifierNameType = ReturnType<typeof peg$type$action41>;
type IdentifierStartType = UnicodeLetterType | "$" | "_" | ReturnType<typeof peg$type$action42>;
type IdentifierPartType = IdentifierStartType | UnicodeCombiningMarkType | NdType | PcType | "\u200c" | "\u200d";
type UnicodeLetterType = LuType | LlType | LtType | LmType | LoType | NlType;
type UnicodeCombiningMarkType = MnType | McType;
type ReservedWordType = KeywordType | FutureReservedWordType | NullTokenType | BooleanLiteralType;
type KeywordType = BreakTokenType | CaseTokenType | CatchTokenType | ContinueTokenType | DebuggerTokenType | DefaultTokenType | DeleteTokenType | DoTokenType | ElseTokenType | FinallyTokenType | ForTokenType | FunctionTokenType | IfTokenType | InstanceofTokenType | InTokenType | NewTokenType | ReturnTokenType | SwitchTokenType | ThisTokenType | ThrowTokenType | TryTokenType | TypeofTokenType | VarTokenType | VoidTokenType | WhileTokenType | WithTokenType;
type FutureReservedWordType = ClassTokenType | ConstTokenType | EnumTokenType | ExportTokenType | ExtendsTokenType | ImportTokenType | SuperTokenType;
type BooleanLiteralType = TrueTokenType | FalseTokenType;
type AnnotationType = ReturnType<typeof peg$type$action47>;
type AnnotationParametersType = ReturnType<typeof peg$type$action62>;
type AnnotationParameterType = ReturnType<typeof peg$type$action63> | ReturnType<typeof peg$type$action64>;
type LiteralMatcherType = ReturnType<typeof peg$type$action65>;
type ValueLiteralType = StringLiteralType | ArrayLiteralType | ReturnType<typeof peg$type$action66> | ReturnType<typeof peg$type$action67>;
type ArrayLiteralType = ReturnType<typeof peg$type$action68>;
type ArrayValuesType = ReturnType<typeof peg$type$action75>;
type StringLiteralType = ReturnType<typeof peg$type$action76> | ReturnType<typeof peg$type$action77> | ReturnType<typeof peg$type$action78>;
type BacktickStringCharacterType = ReturnType<typeof peg$type$action79> | ReturnType<typeof peg$type$action80> | LineContinuationType;
type DoubleStringCharacterType = ReturnType<typeof peg$type$action81> | ReturnType<typeof peg$type$action82> | LineContinuationType;
type SingleStringCharacterType = ReturnType<typeof peg$type$action83> | ReturnType<typeof peg$type$action84> | LineContinuationType;
type CharacterClassMatcherType = ReturnType<typeof peg$type$action85>;
type ClassCharacterRangeType = ReturnType<typeof peg$type$action86>;
type ClassCharacterType = ReturnType<typeof peg$type$action87> | ReturnType<typeof peg$type$action88> | LineContinuationType;
type LineContinuationType = ReturnType<typeof peg$type$action89>;
type EscapeSequenceType = CharacterEscapeSequenceType | ReturnType<typeof peg$type$action90> | HexEscapeSequenceType | UnicodeEscapeSequenceType;
type CharacterEscapeSequenceType = SingleEscapeCharacterType | NonEscapeCharacterType;
type SingleEscapeCharacterType = string | ReturnType<typeof peg$type$action91> | ReturnType<typeof peg$type$action92> | ReturnType<typeof peg$type$action93> | ReturnType<typeof peg$type$action94> | ReturnType<typeof peg$type$action95> | ReturnType<typeof peg$type$action96>;
type NonEscapeCharacterType = ReturnType<typeof peg$type$action97>;
type EscapeCharacterType = SingleEscapeCharacterType | DecimalDigitType | "x" | "u";
type HexEscapeSequenceType = ReturnType<typeof peg$type$action98>;
type UnicodeEscapeSequenceType = ReturnType<typeof peg$type$action99>;
type DecimalDigitType = string;
type HexDigitType = string;
type AnyMatcherType = ReturnType<typeof peg$type$action100>;
type CodeBlockType = ReturnType<typeof peg$type$action101>;
type CodeType = string;
type LlType = string;
type LmType = string;
type LoType = string;
type LtType = string;
type LuType = string;
type McType = string;
type MnType = string;
type NdType = string;
type NlType = string;
type PcType = string;
type ZsType = string;
type BreakTokenType = ["break", undefined];
type CaseTokenType = ["case", undefined];
type CatchTokenType = ["catch", undefined];
type ClassTokenType = ["class", undefined];
type ConstTokenType = ["const", undefined];
type ContinueTokenType = ["continue", undefined];
type DebuggerTokenType = ["debugger", undefined];
type DefaultTokenType = ["default", undefined];
type DeleteTokenType = ["delete", undefined];
type DoTokenType = ["do", undefined];
type ElseTokenType = ["else", undefined];
type EnumTokenType = ["enum", undefined];
type ExportTokenType = ["export", undefined];
type ExtendsTokenType = ["extends", undefined];
type FalseTokenType = ["false", undefined];
type FinallyTokenType = ["finally", undefined];
type ForTokenType = ["for", undefined];
type FunctionTokenType = ["function", undefined];
type IfTokenType = ["if", undefined];
type ImportTokenType = ["import", undefined];
type InstanceofTokenType = ["instanceof", undefined];
type InTokenType = ["in", undefined];
type NewTokenType = ["new", undefined];
type NullTokenType = ["null", undefined];
type ReturnTokenType = ["return", undefined];
type SuperTokenType = ["super", undefined];
type SwitchTokenType = ["switch", undefined];
type ThisTokenType = ["this", undefined];
type ThrowTokenType = ["throw", undefined];
type TrueTokenType = ["true", undefined];
type TryTokenType = ["try", undefined];
type TypeofTokenType = ["typeof", undefined];
type VarTokenType = ["var", undefined];
type VoidTokenType = ["void", undefined];
type WhileTokenType = ["while", undefined];
type WithTokenType = ["with", undefined];
type Type = Array<WhiteSpaceType | LineTerminatorSequenceType | CommentType>;
type Type1 = Array<WhiteSpaceType | MultiLineCommentNoLineTerminatorType>;
type EosType = [Type, ";"] | [Type1, (SingleLineCommentType | null), LineTerminatorSequenceType] | [Type, EofType];
type EofType = undefined;

declare type ParseResults = {
  GrammarType: GrammarType;
  InitializerType: InitializerType;
  RuleType: RuleType;
  ExpressionType: ExpressionType;
  LeadingChoiceExpressionType: LeadingChoiceExpressionType;
  ChoiceExpressionType: ChoiceExpressionType;
  ScopeExpressionType: ScopeExpressionType;
  ActionExpressionType: ActionExpressionType;
  SequenceExpressionType: SequenceExpressionType;
  LabeledExpressionType: LabeledExpressionType;
  PrefixedExpressionType: PrefixedExpressionType;
  PrefixedOperatorType: PrefixedOperatorType;
  SuffixedExpressionType: SuffixedExpressionType;
  SuffixedOperatorType: SuffixedOperatorType;
  PrimaryExpressionType: PrimaryExpressionType;
  RuleReferenceExpressionType: RuleReferenceExpressionType;
  SemanticPredicateExpressionType: SemanticPredicateExpressionType;
  SemanticPredicateOperatorType: SemanticPredicateOperatorType;
  SourceCharacterType: SourceCharacterType;
  WhiteSpaceType: WhiteSpaceType;
  LineTerminatorType: LineTerminatorType;
  LineTerminatorSequenceType: LineTerminatorSequenceType;
  CommentType: CommentType;
  MultiLineCommentType: MultiLineCommentType;
  MultiLineCommentNoLineTerminatorType: MultiLineCommentNoLineTerminatorType;
  SingleLineCommentType: SingleLineCommentType;
  IdentifierType: IdentifierType;
  IdentifierNameType: IdentifierNameType;
  IdentifierStartType: IdentifierStartType;
  IdentifierPartType: IdentifierPartType;
  UnicodeLetterType: UnicodeLetterType;
  UnicodeCombiningMarkType: UnicodeCombiningMarkType;
  ReservedWordType: ReservedWordType;
  KeywordType: KeywordType;
  FutureReservedWordType: FutureReservedWordType;
  BooleanLiteralType: BooleanLiteralType;
  AnnotationType: AnnotationType;
  AnnotationParametersType: AnnotationParametersType;
  AnnotationParameterType: AnnotationParameterType;
  LiteralMatcherType: LiteralMatcherType;
  ValueLiteralType: ValueLiteralType;
  ArrayLiteralType: ArrayLiteralType;
  ArrayValuesType: ArrayValuesType;
  StringLiteralType: StringLiteralType;
  BacktickStringCharacterType: BacktickStringCharacterType;
  DoubleStringCharacterType: DoubleStringCharacterType;
  SingleStringCharacterType: SingleStringCharacterType;
  CharacterClassMatcherType: CharacterClassMatcherType;
  ClassCharacterRangeType: ClassCharacterRangeType;
  ClassCharacterType: ClassCharacterType;
  LineContinuationType: LineContinuationType;
  EscapeSequenceType: EscapeSequenceType;
  CharacterEscapeSequenceType: CharacterEscapeSequenceType;
  SingleEscapeCharacterType: SingleEscapeCharacterType;
  NonEscapeCharacterType: NonEscapeCharacterType;
  EscapeCharacterType: EscapeCharacterType;
  HexEscapeSequenceType: HexEscapeSequenceType;
  UnicodeEscapeSequenceType: UnicodeEscapeSequenceType;
  DecimalDigitType: DecimalDigitType;
  HexDigitType: HexDigitType;
  AnyMatcherType: AnyMatcherType;
  CodeBlockType: CodeBlockType;
  CodeType: CodeType;
  LlType: LlType;
  LmType: LmType;
  LoType: LoType;
  LtType: LtType;
  LuType: LuType;
  McType: McType;
  MnType: MnType;
  NdType: NdType;
  NlType: NlType;
  PcType: PcType;
  ZsType: ZsType;
  BreakTokenType: BreakTokenType;
  CaseTokenType: CaseTokenType;
  CatchTokenType: CatchTokenType;
  ClassTokenType: ClassTokenType;
  ConstTokenType: ConstTokenType;
  ContinueTokenType: ContinueTokenType;
  DebuggerTokenType: DebuggerTokenType;
  DefaultTokenType: DefaultTokenType;
  DeleteTokenType: DeleteTokenType;
  DoTokenType: DoTokenType;
  ElseTokenType: ElseTokenType;
  EnumTokenType: EnumTokenType;
  ExportTokenType: ExportTokenType;
  ExtendsTokenType: ExtendsTokenType;
  FalseTokenType: FalseTokenType;
  FinallyTokenType: FinallyTokenType;
  ForTokenType: ForTokenType;
  FunctionTokenType: FunctionTokenType;
  IfTokenType: IfTokenType;
  ImportTokenType: ImportTokenType;
  InstanceofTokenType: InstanceofTokenType;
  InTokenType: InTokenType;
  NewTokenType: NewTokenType;
  NullTokenType: NullTokenType;
  ReturnTokenType: ReturnTokenType;
  SuperTokenType: SuperTokenType;
  SwitchTokenType: SwitchTokenType;
  ThisTokenType: ThisTokenType;
  ThrowTokenType: ThrowTokenType;
  TrueTokenType: TrueTokenType;
  TryTokenType: TryTokenType;
  TypeofTokenType: TypeofTokenType;
  VarTokenType: VarTokenType;
  VoidTokenType: VoidTokenType;
  WhileTokenType: WhileTokenType;
  WithTokenType: WithTokenType;
  Type: Type;
  Type1: Type1;
  EosType: EosType;
  EofType: EofType;
};

declare function literal<T extends string>(val: T): T;
declare function tuple<T extends any[]>(val: [...T]): [...T];
declare function error(message: string, location?: PegJSLocation): never;
declare function expected(description: string, location?: PegJSLocation): never;
declare function onRollback(fn: () => void): void;
declare function location(): PegJSLocation;
declare function text(): string;

type ParseResult = ParseResults['GrammarType'];
declare const parse: (data: string) => ParseResult;

export {PegJSLocation, PegJSPosition, ParseResults, ParseResult, parse};

// Only meant to make it easier to debug the grammar types
declare const val: ParseResult;
val;
