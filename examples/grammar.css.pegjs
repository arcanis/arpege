/*
 * CSS Grammar
 * ===========
 *
 * Based on grammar from CSS 2.1 specification [1] (including the errata [2]).
 * Generated parser builds a syntax tree composed of nested JavaScript objects,
 * vaguely inspired by CSS DOM [3]. The CSS DOM itself wasn't used as it is not
 * expressive enough (e.g. selectors are reflected as text, not structured
 * objects) and somewhat cumbersome.
 *
 * Limitations:
 *
 *   * Many errors which should be recovered from according to the specification
 *     (e.g. malformed declarations or unexpected end of stylesheet) are fatal.
 *     This is a result of straightforward rewrite of the CSS grammar to PEG.js.
 *
 * [1] http://www.w3.org/TR/2011/REC-CSS2-20110607
 * [2] http://www.w3.org/Style/css2-updates/REC-CSS2-20110607-errata.html
 * [3] http://www.w3.org/TR/DOM-Level-2-Style/css.html
 */

start
  = stylesheet:stylesheet comment* { return stylesheet; }

/* ----- G.1 Grammar ----- */

stylesheet
  = charset:(CHARSET_SYM ::STRING ";")? (S / CDO / CDC)*
    imports:(::import (CDO S* / CDC S*)*)*
    rules:(::(ruleset / media / page) (CDO S* / CDC S*)*)*
    {
      return {
        type:    "StyleSheet" as const,
        charset: charset,
        imports: imports,
        rules:   Object.groupBy(rules, ({type}) => type)
      };
    }

import
  = IMPORT_SYM S* href:(STRING / URI) S* media:media_list? ";" S* {
      return {
        type:  "ImportRule" as const,
        href:  href,
        media: media !== null ? media : []
      };
    }

media
  = MEDIA_SYM S* media:media_list "{" S* rules:ruleset* "}" S* {
      return {
        type: "MediaRule" as const,
        media: media,
        rules: rules
      };
    }

media_list
  = @separator(expr: "," S*)
    medium+

medium
  = name:IDENT S* { return name; }

page
  = PAGE_SYM S* selector:pseudo_page?
    "{" S*
    declarations:(@separator(expr: S*) (::declaration ";")*)
    "}" S*
    {
      return {
        type:         "PageRule" as const,
        selector:     selector,
        declarations: declarations
      };
    }

pseudo_page
  = ":" value:IDENT S* { return { type: "PseudoSelector" as const, value: value }; }

operator
  = "/" S* { return "/" as const; }
  / "," S* { return "," as const; }

combinator
  = "+" S* { return "+" as const; }
  / ">" S* { return ">" as const; }

property
  = name:IDENT S* { return name; }

ruleset
  = selectors:(@separator(expr: "," S*) selector+)
    "{" S*
    declarations:(@separator(expr: S*) (::declaration ";")*) S*
    "}" S*
    {
      return {
        type:         "RuleSet" as const,
        selectors:    selectors,
        declarations: declarations
      };
    }

@type("{type: 'Selector', combinator: ast.Combinator, left: ast.Selector, right: ast.SimpleSelector} | ast.SimpleSelector")
selector
  = left:simple_selector S* combinator:combinator right:selector {
      return {
        type:       "Selector" as const,
        combinator: combinator,
        left:       left,
        right:      right
      };
    }
  / left:simple_selector S+ right:selector {
      return {
        type:       "Selector" as const,
        combinator: " ",
        left:       left,
        right:      right
      };
    }
  / ::simple_selector S*

simple_selector
  = element:element_name qualifiers:(id / class / attrib / pseudo)* {
      return {
        type:       "SimpleSelector" as const,
        element:    element,
        qualifiers: qualifiers
      };
    }
  / qualifiers:(id / class / attrib / pseudo)+ {
      return {
        type:       "SimpleSelector" as const,
        element:    "*",
        qualifiers: qualifiers
      };
    }

id
  = @token(type: "class")
  id:HASH { return { type: "IDSelector" as const, id: id }; }

class
  = @token(type: "class")
    "." class_:IDENT { return { type: "ClassSelector" as const, "class": class_ }; }

element_name
  = IDENT
  / "*"

attrib
  = "[" S*
    attribute:IDENT S*
    operatorAndValue:(operator:("=" / INCLUDES / DASHMATCH) S* value:(IDENT / STRING) S*)?
    "]"
    {
      return {
        type:      "AttributeSelector" as const,
        attribute: attribute,
        operator:  operatorAndValue?.operator,
        value:     operatorAndValue?.value
      };
    }

pseudo
  = ":"
    value:(
        name:FUNCTION S* params:(IDENT S*)? ")" {
          return {
            type:   "Function" as const,
            name:   name,
            params: params !== null ? [params[0]] : []
          };
        }
      / IDENT
    )
    { return { type: "PseudoSelector" as const, value: value }; }

declaration
  = name:property ':' S* value:expr prio:prio? {
      return {
        type:      "Declaration" as const,
        name:      name,
        value:     value,
        important: prio !== null
      };
    }

prio
  = IMPORTANT_SYM S*

expr
  = @type(type: `{type: "Expression", operator: ast.Operator | null, left: ast.Expr, right: ast.Term} | ast.Term`)
    head:term tail:(::operator? ::term)* {
      return tail.reduce((result, [operator, right]) => {
        return {type: `Expression`, operator, left: result, right};
      }, head);
    }

term
  = quantity:(PERCENTAGE / LENGTH / EMS / EXS / ANGLE / TIME / FREQ / NUMBER)
    S*
    {
      return {
        type:  "Quantity" as const,
        value: quantity.value,
        unit:  quantity.unit
      };
    }
  / value:STRING S* { return { type: "String" as const, value: value }; }
  / value:URI S*    { return { type: "URI" as const,    value: value }; }
  / function
  / hexcolor
  / value:IDENT S*  { return { type: "Ident" as const,  value: value }; }

function
  = name:FUNCTION S* params:(@type(type: "any") expr) ")" S* {
      return { type: "Function" as const, name: name, params: params };
    }

hexcolor
  = value:HASH S* { return { type: "Hexcolor" as const, value: value }; }

/* ----- G.2 Lexical scanner ----- */

/* Macros */

h
  = [0-9a-f]i

nonascii
  = [\x80-\uFFFF]

unicode
  = "\\" digits:$(h h? h? h? h? h?) ("\r\n" / [ \t\r\n\f])? {
      return String.fromCharCode(parseInt(digits, 16));
    }

escape
  = unicode
  / "\\" ch:[^\r\n\f0-9a-f]i { return ch; }

nmstart
  = [_a-z]i
  / nonascii
  / escape

nmchar
  = [_a-z0-9-]i
  / nonascii
  / escape

string1
  = '"' chars:([^\n\r\f\\"] / "\\" nl:nl { return ""; } / escape)* '"' {
      return chars.join("");
    }

string2
  = "'" chars:([^\n\r\f\\'] / "\\" nl:nl { return ""; } / escape)* "'" {
      return chars.join("");
    }

comment
  = "/*" [^*]* "*"+ ([^/*] [^*]* "*"+)* "/"

ident
  = $(prefix:$"-"? start:nmstart chars:nmchar*)

name
  = chars:nmchar+ { return chars.join(""); }

num
  = [+-]? ([0-9]+ / [0-9]* "." [0-9]+) ("e" [+-]? [0-9]+)? {
      return parseFloat(text());
    }

string
  = string1
  / string2

url
  = chars:([!#$%&*-\[\]-~] / nonascii / escape)* { return chars.join(""); }

s
  = [ \t\r\n\f]+

w
  = s?

nl
  = "\n"
  / "\r\n"
  / "\r"
  / "\f"

A  = "a"i / "\\" "0"? "0"? "0"? "0"? [\x41\x61] ("\r\n" / [ \t\r\n\f])? { return "a"; }
C  = "c"i / "\\" "0"? "0"? "0"? "0"? [\x43\x63] ("\r\n" / [ \t\r\n\f])? { return "c"; }
D  = "d"i / "\\" "0"? "0"? "0"? "0"? [\x44\x64] ("\r\n" / [ \t\r\n\f])? { return "d"; }
E  = "e"i / "\\" "0"? "0"? "0"? "0"? [\x45\x65] ("\r\n" / [ \t\r\n\f])? { return "e"; }
G  = "g"i / "\\" "0"? "0"? "0"? "0"? [\x47\x67] ("\r\n" / [ \t\r\n\f])? / "\\g"i { return "g"; }
H  = "h"i / "\\" "0"? "0"? "0"? "0"? [\x48\x68] ("\r\n" / [ \t\r\n\f])? / "\\h"i { return "h"; }
I  = "i"i / "\\" "0"? "0"? "0"? "0"? [\x49\x69] ("\r\n" / [ \t\r\n\f])? / "\\i"i { return "i"; }
K  = "k"i / "\\" "0"? "0"? "0"? "0"? [\x4b\x6b] ("\r\n" / [ \t\r\n\f])? / "\\k"i { return "k"; }
L  = "l"i / "\\" "0"? "0"? "0"? "0"? [\x4c\x6c] ("\r\n" / [ \t\r\n\f])? / "\\l"i { return "l"; }
M  = "m"i / "\\" "0"? "0"? "0"? "0"? [\x4d\x6d] ("\r\n" / [ \t\r\n\f])? / "\\m"i { return "m"; }
N  = "n"i / "\\" "0"? "0"? "0"? "0"? [\x4e\x6e] ("\r\n" / [ \t\r\n\f])? / "\\n"i { return "n"; }
O  = "o"i / "\\" "0"? "0"? "0"? "0"? [\x4f\x6f] ("\r\n" / [ \t\r\n\f])? / "\\o"i { return "o"; }
P  = "p"i / "\\" "0"? "0"? "0"? "0"? [\x50\x70] ("\r\n" / [ \t\r\n\f])? / "\\p"i { return "p"; }
R  = "r"i / "\\" "0"? "0"? "0"? "0"? [\x52\x72] ("\r\n" / [ \t\r\n\f])? / "\\r"i { return "r"; }
S_ = "s"i / "\\" "0"? "0"? "0"? "0"? [\x53\x73] ("\r\n" / [ \t\r\n\f])? / "\\s"i { return "s"; }
T  = "t"i / "\\" "0"? "0"? "0"? "0"? [\x54\x74] ("\r\n" / [ \t\r\n\f])? / "\\t"i { return "t"; }
U  = "u"i / "\\" "0"? "0"? "0"? "0"? [\x55\x75] ("\r\n" / [ \t\r\n\f])? / "\\u"i { return "u"; }
X  = "x"i / "\\" "0"? "0"? "0"? "0"? [\x58\x78] ("\r\n" / [ \t\r\n\f])? / "\\x"i { return "x"; }
Z  = "z"i / "\\" "0"? "0"? "0"? "0"? [\x5a\x7a] ("\r\n" / [ \t\r\n\f])? / "\\z"i { return "z"; }

/* Tokens */

S "whitespace"
  = comment* s

CDO "<!--"
  = comment* "<!--"

CDC "-->"
  = comment* "-->"

INCLUDES "~="
  = comment* "~="

DASHMATCH "|="
  = comment* "|="

STRING "string"
  = comment* string:string { return string; }

IDENT "identifier"
  = comment* ident:ident { return ident; }

HASH "hash"
  = comment* "#" name:name { return "#" + name; }

IMPORT_SYM "@import"
  = comment* "@" I M P O R T

PAGE_SYM "@page"
  = comment* "@" P A G E

MEDIA_SYM "@media"
  = comment* "@" M E D I A

CHARSET_SYM "@charset"
  = comment* "@charset "

/* We use |s| instead of |w| here to avoid infinite recursion. */
IMPORTANT_SYM "!important"
  = comment* "!" (s / comment)* I M P O R T A N T

EMS "length"
  = comment* value:num E M { return { value: value, unit: "em" }; }

EXS "length"
  = comment* value:num E X { return { value: value, unit: "ex" }; }

LENGTH "length"
  = comment* value:num P X { return { value: value, unit: "px" }; }
  / comment* value:num C M { return { value: value, unit: "cm" }; }
  / comment* value:num M M { return { value: value, unit: "mm" }; }
  / comment* value:num I N { return { value: value, unit: "in" }; }
  / comment* value:num P T { return { value: value, unit: "pt" }; }
  / comment* value:num P C { return { value: value, unit: "pc" }; }

ANGLE "angle"
  = comment* value:num D E G   { return { value: value, unit: "deg"  }; }
  / comment* value:num R A D   { return { value: value, unit: "rad"  }; }
  / comment* value:num G R A D { return { value: value, unit: "grad" }; }

TIME "time"
  = comment* value:num M S_ { return { value: value, unit: "ms" }; }
  / comment* value:num S_   { return { value: value, unit: "s"  }; }

FREQ "frequency"
  = comment* value:num H Z   { return { value: value, unit: "hz" }; }
  / comment* value:num K H Z { return { value: value, unit: "kh" }; }

PERCENTAGE "percentage"
  = comment* value:num "%" { return { value: value, unit: "%" }; }

NUMBER "number"
  = comment* value:num { return { value: value, unit: null }; }

URI "uri"
  = comment* U R L "("i w url:string w ")" { return url; }
  / comment* U R L "("i w url:url w ")"    { return url; }

FUNCTION "function"
  = comment* name:ident "(" { return name; }
