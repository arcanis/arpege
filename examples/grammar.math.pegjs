/*
 * Simple Arithmetics Grammar
 * ==========================
 *
 * Accepts expressions like "2 * (3 + 4)" and computes their value.
 */

Expression
  = head:Term tail:(_ (@op ("+" / "-")) _ Term)* {
      var result = head, i;

      for (i = 0; i < tail.length; i++) {
        if (tail[i][1] === "+") { result += tail[i][3]; }
        if (tail[i][1] === "-") { result -= tail[i][3]; }
      }

      return result;
    }

Term
  = head:Factor tail:(_ (@op ("*" / "/")) _ Factor)* {
      var result = head, i;

      for (i = 0; i < tail.length; i++) {
        if (tail[i][1] === "*") { result *= tail[i][3]; }
        if (tail[i][1] === "/") { result /= tail[i][3]; }
      }

      return result;
    }

Factor
  = "(" _ expr:Expression _ ")" { return expr; }
  / Integer

Integer "number"
  = @token(type: "number")
    [0-9]+ { return parseInt(text(), 10); }

_
  = @token(type: "whitespace")
    [ \t\n\r]*
