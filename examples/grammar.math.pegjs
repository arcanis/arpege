// Simple Arithmetics Grammar
// ==========================
//
// Accepts expressions like "2 * (3 + 4)" and computes their value.

Expression
  = head:Term tail:(_ op:("+" / "-") _ val:Term)* {
      return tail.reduce((result, {op, val}) => {
        if (op === "+") { return result + val; }
        if (op === "-") { return result - val; }
      }, head);
    }

Term
  = head:Factor tail:(_ op:("*" / "/") _ val:Factor)* {
      return tail.reduce((result, {op, val}) => {
        if (op === "*") { return result * val; }
        if (op === "/") { return result / val; }
      }, head);
    }

Factor
  = "(" _ ::Expression _ ")"
  / Integer

Integer "integer"
  = _ (@token(type: "number") [0-9]+) {
      return parseInt(text(), 10);
    }

_ "whitespace"
  = [ \t\n\r]*
