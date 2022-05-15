import {generate, GenerateOptions} from 'arpege';

import './compiler/passes/helpers';

describe(`generated parser behavior`, () => {
  function varyOptimizationOptions(fn: (options: Partial<GenerateOptions>) => void) {
    const variants: Array<Partial<GenerateOptions>> = [
      {cache: false, optimize: `speed`, trace: false},
      {cache: false, optimize: `speed`, trace: true},
      {cache: true,  optimize: `speed`, trace: false},
      {cache: true,  optimize: `speed`, trace: true},
    ];

    for (const variant of variants) {
      describe(`with options ${JSON.stringify(variant)}`, () => {
        if (variant.trace) {
          beforeEach(() => {
            jest.spyOn(console, `log`).mockImplementation(() => {});
          });
        }

        fn({...variant});
      });
    }
  }

  varyOptimizationOptions(options => {
    describe(`initializer`, () => {
      it(`executes the code before parsing starts`, () => {
        const parser = generate([
          `{ var result = 42; }`,
          `start = "a" { return result; }`,
        ].join(`\n`), options);

        expect(parser).toParseLanguage(`a`, 42);
      });

      describe(`available variables and functions`, () => {
        it(`|options| contains options`, () => {
          const parser = generate([
            `{ var result = options; }`,
            `start = "a" { return result; }`,
          ].join(`\n`), options);

          expect(parser).toParseLanguage(`a`, {a: 42}, {a: 42});
        });
      });
    });

    if (!options.cache) {
      describe(`transaction`, () => {
        it(`calls rollback handlers when an optional doesn't fully match`, () => {
          const parser = generate([
            `{ var result = 0; }`,
            `start = (a b)? a { return result; }`,
            `a = "a" { result += 1; onRollback(() => { result -= 1; }) }`,
            `b = "b"`,
          ].join(`\n`), options);

          expect(parser).toParseLanguage(`a`, 1);
        });

        it(`calls rollback handlers when a * operator doesn't match`, () => {
          const parser = generate([
            `{ var result = 0; }`,
            `start = (a b)* a { return result; }`,
            `a = "a" { result += 1; onRollback(() => { result -= 1; }) }`,
            `b = "b"`,
          ].join(`\n`), options);

          expect(parser).toParseLanguage(`a`, 1);
        });

        it(`calls rollback handlers when a + operator doesn't match`, () => {
          const parser = generate([
            `{ var result = 0; }`,
            `start = (a b)+ a { return result; }`,
            `a = "a" { result += 1; onRollback(() => { result -= 1; }) }`,
            `b = "b"`,
          ].join(`\n`), options);

          expect(parser).toParseLanguage(`aba`, 2);
        });

        it(`calls rollback handlers when a / operator doesn't match`, () => {
          const parser = generate([
            `{ var result = 0; }`,
            `start = (a b / a) { return result; }`,
            `a = "a" { result += 1; onRollback(() => { result -= 1; }) }`,
            `b = "b"`,
          ].join(`\n`), options);

          expect(parser).toParseLanguage(`a`, 1);
        });
      });

      describe(`scope`, () => {
        it(`calls the scope callback before attempting the match`, () => {
          const parser = generate([
            `{ var result = []; }`,
            `start = (a ^{result.push('enter')}) {return result}`,
            `a = "a" {result.push('a')}`,
          ].join(`\n`), options);

          expect(parser).toParseLanguage(`a`, [`enter`, `a`]);
        });

        it(`calls the scope callback result after a successful match`, () => {
          const parser = generate([
            `{ var result = []; }`,
            `start = (a ^{return () => {result.push('exit')}}) {return result}`,
            `a = "a" {result.push('a')}`,
          ].join(`\n`), options);

          expect(parser).toParseLanguage(`a`, [`a`, `exit`]);
        });

        it(`calls the scope callback result after a failed match`, () => {
          const parser = generate([
            `{ var result = []; }`,
            `start = (a ^{return () => {result.push('exit')}})? {return result}`,
            `a = "a" {result.push('a')}`,
          ].join(`\n`), options);

          expect(parser).toParseLanguage(``, [`exit`]);
        });
      });
    }

    describe(`rule`, () => {
      if (options.cache) {
        it(`caches rule match results`, () => {
          const parser = generate([
            `{ var n = 0; }`,
            `start = (a "b") / (a "c") { return n; }`,
            `a = "a" { n++; }`,
          ].join(`\n`), options);

          expect(parser).toParseLanguage(`ac`, 1);
        });
      } else {
        it(`doesn't cache rule match results`, () => {
          const parser = generate([
            `{ var n = 0; }`,
            `start = (a "b") / (a "c") { return n; }`,
            `a = "a" { n++; }`,
          ].join(`\n`), options);

          expect(parser).toParseLanguage(`ac`, 2);
        });
      }

      describe(`when the expression matches`, () => {
        it(`returns its match result`, () => {
          const parser = generate(`start = "a"`);

          expect(parser).toParseLanguage(`a`, `a`);
        });
      });

      describe(`when the expression doesn't match`, () => {
        describe(`without display name`, () => {
          it(`reports match failure and doesn't record any expectation`, () => {
            const parser = generate(`start = "a"`);

            expect(parser).toFailToParseLanguage(`b`, {
              expected: [{type: `literal`, text: `a`, ignoreCase: false}],
            });
          });
        });

        describe(`with display name`, () => {
          it(`reports match failure and records an expectation of type "other"`, () => {
            const parser = generate(`start "start" = "a"`);

            expect(parser).toFailToParseLanguage(`b`, {
              expected: [{type: `other`, description: `start`}],
            });
          });

          it(`discards any expectations recorded when matching the expression`, () => {
            const parser = generate(`start "start" = "a"`);

            expect(parser).toFailToParseLanguage(`b`, {
              expected: [{type: `other`, description: `start`}],
            });
          });
        });
      });
    });

    describe(`literal`, () => {
      describe(`matching`, () => {
        it(`matches empty literals`, () => {
          const parser = generate(`start = ""`, options);

          expect(parser).toParseLanguage(``);
        });

        it(`matches one-character literals`, () => {
          const parser = generate(`start = "a"`, options);

          expect(parser).toParseLanguage(`a`);
          expect(parser).toFailToParseLanguage(`b`);
        });

        it(`matches multi-character literals`, () => {
          const parser = generate(`start = "abcd"`, options);

          expect(parser).toParseLanguage(`abcd`);
          expect(parser).toFailToParseLanguage(`efgh`);
        });

        it(`is case sensitive without the "i" flag`, () => {
          const parser = generate(`start = "a"`, options);

          expect(parser).toParseLanguage(`a`);
          expect(parser).toFailToParseLanguage(`A`);
        });

        it(`is case insensitive with the "i" flag`, () => {
          const parser = generate(`start = "a"i`, options);

          expect(parser).toParseLanguage(`a`);
          expect(parser).toParseLanguage(`A`);
        });
      });

      describe(`when it matches`, () => {
        it(`returns the matched text`, () => {
          const parser = generate(`start = "a"`, options);

          expect(parser).toParseLanguage(`a`, `a`);
        });

        it(`consumes the matched text`, () => {
          const parser = generate(`start = "a" .`, options);

          expect(parser).toParseLanguage(`ab`);
        });
      });

      describe(`when it doesn't match`, () => {
        it(`reports match failure and records an expectation of type "literal"`, () => {
          const parser = generate(`start = "a"`, options);

          expect(parser).toFailToParseLanguage(`b`, {
            expected: [{type: `literal`, text: `a`, ignoreCase: false}],
          });
        });
      });
    });

    describe(`character class`, () => {
      describe(`matching`, () => {
        it(`matches empty classes`, () => {
          const parser = generate(`start = []`, options);

          expect(parser).toFailToParseLanguage(`a`);
        });

        it(`matches classes with a character list`, () => {
          const parser = generate(`start = [abc]`, options);

          expect(parser).toParseLanguage(`a`);
          expect(parser).toParseLanguage(`b`);
          expect(parser).toParseLanguage(`c`);
          expect(parser).toFailToParseLanguage(`d`);
        });

        it(`matches classes with a character range`, () => {
          const parser = generate(`start = [a-c]`, options);

          expect(parser).toParseLanguage(`a`);
          expect(parser).toParseLanguage(`b`);
          expect(parser).toParseLanguage(`c`);
          expect(parser).toFailToParseLanguage(`d`);
        });

        it(`matches inverted classes`, () => {
          const parser = generate(`start = [^a]`, options);

          expect(parser).toFailToParseLanguage(`a`);
          expect(parser).toParseLanguage(`b`);
        });

        it(`is case sensitive without the "i" flag`, () => {
          const parser = generate(`start = [a]`, options);

          expect(parser).toParseLanguage(`a`);
          expect(parser).toFailToParseLanguage(`A`);
        });

        it(`is case insensitive with the "i" flag`, () => {
          const parser = generate(`start = [a]i`, options);

          expect(parser).toParseLanguage(`a`);
          expect(parser).toParseLanguage(`A`);
        });
      });

      describe(`when it matches`, () => {
        it(`returns the matched character`, () => {
          const parser = generate(`start = [a]`, options);

          expect(parser).toParseLanguage(`a`, `a`);
        });

        it(`consumes the matched character`, () => {
          const parser = generate(`start = [a] .`, options);

          expect(parser).toParseLanguage(`ab`);
        });
      });

      describe(`when it doesn't match`, () => {
        it(`reports match failure and records an expectation of type "class"`, () => {
          const parser = generate(`start = [a]`, options);

          expect(parser).toFailToParseLanguage(`b`, {
            expected: [{type: `class`, parts: [`a`], inverted: false, ignoreCase: false}],
          });
        });
      });
    });

    describe(`dot`, () => {
      describe(`matching`, () => {
        it(`matches any character`, () => {
          const parser = generate(`start = .`, options);

          expect(parser).toParseLanguage(`a`);
          expect(parser).toParseLanguage(`b`);
          expect(parser).toParseLanguage(`c`);
        });
      });

      describe(`when it matches`, () => {
        it(`returns the matched character`, () => {
          const parser = generate(`start = .`, options);

          expect(parser).toParseLanguage(`a`, `a`);
        });

        it(`consumes the matched character`, () => {
          const parser = generate(`start = . .`, options);

          expect(parser).toParseLanguage(`ab`);
        });
      });

      describe(`when it doesn't match`, () => {
        it(`reports match failure and records an expectation of type "any"`, () => {
          const parser = generate(`start = .`, options);

          expect(parser).toFailToParseLanguage(``, {
            expected: [{type: `any`}],
          });
        });
      });
    });

    describe(`rule reference`, () => {
      describe(`when referenced rule's expression matches`, () => {
        it(`returns its result`, () => {
          const parser = generate([
            `start = a`,
            `a = "a"`,
          ].join(`\n`), options);

          expect(parser).toParseLanguage(`a`, `a`);
        });
      });

      describe(`when referenced rule's expression doesn't match`, () => {
        it(`reports match failure`, () => {
          const parser = generate([
            `start = a`,
            `a = "a"`,
          ].join(`\n`), options);

          expect(parser).toFailToParseLanguage(`b`);
        });
      });
    });

    describe(`positive semantic predicate`, () => {
      describe(`when the code returns a truthy value`, () => {
        it(`returns |undefined|`, () => {
          /*
           * The |""| is needed so that the parser doesn't return just
           * |undefined| which we can't compare against in |toParseLanguage| due to the
           * way optional parameters work.
           */
          const parser = generate(`start = &{ return true; } ""`, options);

          expect(parser).toParseLanguage(``, [undefined, ``]);
        });
      });

      describe(`when the code returns a falsey value`, () => {
        it(`reports match failure`, () => {
          const parser = generate(`start = &{ return false; }`, options);

          expect(parser).toFailToParseLanguage(``);
        });
      });

      describe(`label variables`, () => {
        describe(`in containing sequence`, () => {
          it(`can access variables defined by preceding labeled elements`, () => {
            const parser = generate(
              `start = a:"a" &{ return a === "a"; }`,
              options,
            );

            expect(parser).toParseLanguage(`a`);
          });

          it(`cannot access variable defined by labeled predicate element`, () => {
            const parser = generate(
              `start = "a" b:&{ return b === undefined; } "c"`,
              options,
            );

            expect(parser).toFailToParseLanguage(`ac`);
          });

          it(`cannot access variables defined by following labeled elements`, () => {
            const parser = generate(
              `start = &{ return a === "a"; } a:"a"`,
              options,
            );

            expect(parser).toFailToParseLanguage(`a`);
          });

          it(`cannot access variables defined by subexpressions`, () => {
            var testcases = [
                {
                  grammar: `start = (a:"a") &{ return a === "a"; }`,
                  input: `a`,
                },
                {
                  grammar: `start = (a:"a")? &{ return a === "a"; }`,
                  input: `a`,
                },
                {
                  grammar: `start = (a:"a")* &{ return a === "a"; }`,
                  input: `a`,
                },
                {
                  grammar: `start = (a:"a")+ &{ return a === "a"; }`,
                  input: `a`,
                },
                {
                  grammar: `start = $(a:"a") &{ return a === "a"; }`,
                  input: `a`,
                },
                {
                  grammar: `start = &(a:"a") "a" &{ return a === "a"; }`,
                  input: `a`,
                },
                {
                  grammar: `start = !(a:"a") "b" &{ return a === "a"; }`,
                  input: `b`,
                },
                {
                  grammar: `start = b:(a:"a") &{ return a === "a"; }`,
                  input: `a`,
                },
                {
                  grammar: `start = ("a" b:"b" "c") &{ return b === "b"; }`,
                  input: `abc`,
                },
                {
                  grammar: `start = (a:"a" { return a; }) &{ return a === "a"; }`,
                  input: `a`,
                },
                {
                  grammar: `start = ("a" / b:"b" / "c") &{ return b === "b"; }`,
                  input: `b`,
                },
              ],
              parser, i;

            for (i = 0; i < testcases.length; i++) {
              parser = generate(testcases[i].grammar, options);
              expect(parser).toFailToParseLanguage(testcases[i].input);
            }
          });
        });

        describe(`in outer sequence`, () => {
          it(`can access variables defined by preceding labeled elements`, () => {
            const parser = generate(
              `start = a:"a" ("b" &{ return a === "a"; })`,
              options,
            );

            expect(parser).toParseLanguage(`ab`);
          });

          it(`cannot access variable defined by labeled predicate element`, () => {
            const parser = generate(
              `start = "a" b:("b" &{ return b === undefined; }) "c"`,
              options,
            );

            expect(parser).toFailToParseLanguage(`abc`);
          });

          it(`cannot access variables defined by following labeled elements`, () => {
            const parser = generate(
              `start = ("a" &{ return b === "b"; }) b:"b"`,
              options,
            );

            expect(parser).toFailToParseLanguage(`ab`);
          });
        });
      });

      describe(`initializer variables & functions`, () => {
        it(`can access variables defined in the initializer`, () => {
          const parser = generate([
            `{ var v = 42 }`,
            `start = &{ return v === 42; }`,
          ].join(`\n`), options);

          expect(parser).toParseLanguage(``);
        });

        it(`can access functions defined in the initializer`, () => {
          const parser = generate([
            `{ function f() { return 42; } }`,
            `start = &{ return f() === 42; }`,
          ].join(`\n`), options);

          expect(parser).toParseLanguage(``);
        });
      });

      describe(`available variables & functions`, () => {
        it(`|options| contains options`, () => {
          const parser = generate([
            `{ var result; }`,
            `start = &{ result = options; return true; } { return result; }`,
          ].join(`\n`), options);

          expect(parser).toParseLanguage(``, {a: 42}, {a: 42});
        });

        it(`|location| returns current location info`, () => {
          const parser = generate([
            `{ var result; }`,
            `start  = line (nl+ line)* { return result; }`,
            `line   = thing (" "+ thing)*`,
            `thing  = digit / mark`,
            `digit  = [0-9]`,
            `mark   = &{ result = location(); return true; } "x"`,
            `nl     = "\\r"? "\\n"`,
          ].join(`\n`), options);

          expect(parser).toParseLanguage(`1\n2\n\n3\n\n\n4 5 x`, {
            start: {offset: 13, line: 7, column: 5},
            end: {offset: 13, line: 7, column: 5},
          });

          /* Newline representations */
          expect(parser).toParseLanguage(`1\nx`, {     // Unix
            start: {offset: 2, line: 2, column: 1},
            end: {offset: 2, line: 2, column: 1},
          });
          expect(parser).toParseLanguage(`1\r\nx`, {   // Windows
            start: {offset: 3, line: 2, column: 1},
            end: {offset: 3, line: 2, column: 1},
          });
        });
      });
    });

    describe(`negative semantic predicate`, () => {
      describe(`when the code returns a falsey value`, () => {
        it(`returns |undefined|`, () => {
          /*
           * The |""| is needed so that the parser doesn't return just
           * |undefined| which we can't compare against in |toParseLanguage| due to the
           * way optional parameters work.
           */
          const parser = generate(`start = !{ return false; } ""`, options);

          expect(parser).toParseLanguage(``, [undefined, ``]);
        });
      });

      describe(`when the code returns a truthy value`, () => {
        it(`reports match failure`, () => {
          const parser = generate(`start = !{ return true; }`, options);

          expect(parser).toFailToParseLanguage(``);
        });
      });

      describe(`label variables`, () => {
        describe(`in containing sequence`, () => {
          it(`can access variables defined by preceding labeled elements`, () => {
            const parser = generate(
              `start = a:"a" !{ return a !== "a"; }`,
              options,
            );

            expect(parser).toParseLanguage(`a`);
          });

          it(`cannot access variable defined by labeled predicate element`, () => {
            const parser = generate(
              `start = "a" b:!{ return b !== undefined; } "c"`,
              options,
            );

            expect(parser).toFailToParseLanguage(`ac`);
          });

          it(`cannot access variables defined by following labeled elements`, () => {
            const parser = generate(
              `start = !{ return a !== "a"; } a:"a"`,
              options,
            );

            expect(parser).toFailToParseLanguage(`a`);
          });

          it(`cannot access variables defined by subexpressions`, () => {
            var testcases = [
                {
                  grammar: `start = (a:"a") !{ return a !== "a"; }`,
                  input: `a`,
                },
                {
                  grammar: `start = (a:"a")? !{ return a !== "a"; }`,
                  input: `a`,
                },
                {
                  grammar: `start = (a:"a")* !{ return a !== "a"; }`,
                  input: `a`,
                },
                {
                  grammar: `start = (a:"a")+ !{ return a !== "a"; }`,
                  input: `a`,
                },
                {
                  grammar: `start = $(a:"a") !{ return a !== "a"; }`,
                  input: `a`,
                },
                {
                  grammar: `start = &(a:"a") "a" !{ return a !== "a"; }`,
                  input: `a`,
                },
                {
                  grammar: `start = !(a:"a") "b" !{ return a !== "a"; }`,
                  input: `b`,
                },
                {
                  grammar: `start = b:(a:"a") !{ return a !== "a"; }`,
                  input: `a`,
                },
                {
                  grammar: `start = ("a" b:"b" "c") !{ return b !== "b"; }`,
                  input: `abc`,
                },
                {
                  grammar: `start = (a:"a" { return a; }) !{ return a !== "a"; }`,
                  input: `a`,
                },
                {
                  grammar: `start = ("a" / b:"b" / "c") !{ return b !== "b"; }`,
                  input: `b`,
                },
              ],
              parser, i;

            for (i = 0; i < testcases.length; i++) {
              parser = generate(testcases[i].grammar, options);
              expect(parser).toFailToParseLanguage(testcases[i].input);
            }
          });
        });

        describe(`in outer sequence`, () => {
          it(`can access variables defined by preceding labeled elements`, () => {
            const parser = generate(
              `start = a:"a" ("b" !{ return a !== "a"; })`,
              options,
            );

            expect(parser).toParseLanguage(`ab`);
          });

          it(`cannot access variable defined by labeled predicate element`, () => {
            const parser = generate(
              `start = "a" b:("b" !{ return b !== undefined; }) "c"`,
              options,
            );

            expect(parser).toFailToParseLanguage(`abc`);
          });

          it(`cannot access variables defined by following labeled elements`, () => {
            const parser = generate(
              `start = ("a" !{ return b !== "b"; }) b:"b"`,
              options,
            );

            expect(parser).toFailToParseLanguage(`ab`);
          });
        });
      });

      describe(`initializer variables & functions`, () => {
        it(`can access variables defined in the initializer`, () => {
          const parser = generate([
            `{ var v = 42 }`,
            `start = !{ return v !== 42; }`,
          ].join(`\n`), options);

          expect(parser).toParseLanguage(``);
        });

        it(`can access functions defined in the initializer`, () => {
          const parser = generate([
            `{ function f() { return 42; } }`,
            `start = !{ return f() !== 42; }`,
          ].join(`\n`), options);

          expect(parser).toParseLanguage(``);
        });
      });

      describe(`available variables & functions`, () => {
        it(`|options| contains options`, () => {
          const parser = generate([
            `{ var result; }`,
            `start = !{ result = options; return false; } { return result; }`,
          ].join(`\n`), options);

          expect(parser).toParseLanguage(``, {a: 42}, {a: 42});
        });

        it(`|location| returns current location info`, () => {
          const parser = generate([
            `{ var result; }`,
            `start  = line (nl+ line)* { return result; }`,
            `line   = thing (" "+ thing)*`,
            `thing  = digit / mark`,
            `digit  = [0-9]`,
            `mark   = !{ result = location(); return false; } "x"`,
            `nl     = "\\r"? "\\n"`,
          ].join(`\n`), options);

          expect(parser).toParseLanguage(`1\n2\n\n3\n\n\n4 5 x`, {
            start: {offset: 13, line: 7, column: 5},
            end: {offset: 13, line: 7, column: 5},
          });

          /* Newline representations */
          expect(parser).toParseLanguage(`1\nx`, {     // Unix
            start: {offset: 2, line: 2, column: 1},
            end: {offset: 2, line: 2, column: 1},
          });
          expect(parser).toParseLanguage(`1\r\nx`, {   // Windows
            start: {offset: 3, line: 2, column: 1},
            end: {offset: 3, line: 2, column: 1},
          });
        });
      });
    });

    describe(`group`, () => {
      describe(`when the expression matches`, () => {
        it(`returns its match result`, () => {
          const parser = generate(`start = ("a")`, options);

          expect(parser).toParseLanguage(`a`, `a`);
        });
      });

      describe(`when the expression doesn't match`, () => {
        it(`reports match failure`, () => {
          const parser = generate(`start = ("a")`, options);

          expect(parser).toFailToParseLanguage(`b`);
        });
      });
    });

    describe(`optional`, () => {
      describe(`when the expression matches`, () => {
        it(`returns its match result`, () => {
          const parser = generate(`start = "a"?`, options);

          expect(parser).toParseLanguage(`a`, `a`);
        });
      });

      describe(`when the expression doesn't match`, () => {
        it(`returns |null|`, () => {
          const parser = generate(`start = "a"?`, options);

          expect(parser).toParseLanguage(``, null);
        });
      });
    });

    describe(`zero or more`, () => {
      describe(`when the expression matches zero or more times`, () => {
        it(`returns an array of its match results`, () => {
          const parser = generate(`start = "a"*`, options);

          expect(parser).toParseLanguage(``,    []);
          expect(parser).toParseLanguage(`a`,   [`a`]);
          expect(parser).toParseLanguage(`aaa`, [`a`, `a`, `a`]);
        });
      });
    });

    describe(`one or more`, () => {
      describe(`when the expression matches one or more times`, () => {
        it(`returns an array of its match results`, () => {
          const parser = generate(`start = "a"+`, options);

          expect(parser).toParseLanguage(`a`,   [`a`]);
          expect(parser).toParseLanguage(`aaa`, [`a`, `a`, `a`]);
        });
      });

      describe(`when the expression doesn't match`, () => {
        it(`reports match failure`, () => {
          const parser = generate(`start = "a"+`, options);

          expect(parser).toFailToParseLanguage(``);
        });
      });
    });

    describe(`text`, () => {
      describe(`when the expression matches`, () => {
        it(`returns the matched text`, () => {
          const parser = generate(`start = $("a" "b" "c")`, options);

          expect(parser).toParseLanguage(`abc`, `abc`);
        });
      });

      describe(`when the expression doesn't match`, () => {
        it(`reports match failure`, () => {
          const parser = generate(`start = $("a")`, options);

          expect(parser).toFailToParseLanguage(`b`);
        });
      });
    });

    describe(`positive simple predicate`, () => {
      describe(`when the expression matches`, () => {
        it(`returns |undefined|`, () => {
          const parser = generate(`start = &"a" "a"`, options);

          expect(parser).toParseLanguage(`a`, [undefined, `a`]);
        });

        it(`resets parse position`, () => {
          const parser = generate(`start = &"a" "a"`, options);

          expect(parser).toParseLanguage(`a`);
        });
      });

      describe(`when the expression doesn't match`, () => {
        it(`reports match failure`, () => {
          const parser = generate(`start = &"a"`, options);

          expect(parser).toFailToParseLanguage(`b`);
        });

        it(`discards any expectations recorded when matching the expression`, () => {
          const parser = generate(`start = "a" / &"b" / "c"`, options);

          expect(parser).toFailToParseLanguage(`d`, {
            expected: [
              {type: `literal`, text: `a`, ignoreCase: false},
              {type: `literal`, text: `c`, ignoreCase: false},
            ],
          });
        });
      });
    });

    describe(`negative simple predicate`, () => {
      describe(`when the expression matches`, () => {
        it(`reports match failure`, () => {
          const parser = generate(`start = !"a"`, options);

          expect(parser).toFailToParseLanguage(`a`);
        });
      });

      describe(`when the expression doesn't match`, () => {
        it(`returns |undefined|`, () => {
          const parser = generate(`start = !"a" "b"`, options);

          expect(parser).toParseLanguage(`b`, [undefined, `b`]);
        });

        it(`resets parse position`, () => {
          const parser = generate(`start = !"a" "b"`, options);

          expect(parser).toParseLanguage(`b`);
        });

        it(`discards any expectations recorded when matching the expression`, () => {
          const parser = generate(`start = "a" / !"b" / "c"`, options);

          expect(parser).toFailToParseLanguage(`b`, {
            expected: [
              {type: `literal`, text: `a`, ignoreCase: false},
              {type: `literal`, text: `c`, ignoreCase: false},
            ],
          });
        });
      });
    });

    describe(`label`, () => {
      describe(`when the expression matches`, () => {
        it(`returns its match result`, () => {
          const parser = generate(`start = a:"a"`, options);

          expect(parser).toParseLanguage(`a`, `a`);
        });
      });

      describe(`when the expression doesn't match`, () => {
        it(`reports match failure`, () => {
          const parser = generate(`start = a:"a"`, options);

          expect(parser).toFailToParseLanguage(`b`);
        });
      });
    });

    describe(`sequence`, () => {
      describe(`when all expressions match`, () => {
        it(`returns an array of their match results`, () => {
          const parser = generate(`start = "a" "b" "c"`, options);

          expect(parser).toParseLanguage(`abc`, [`a`, `b`, `c`]);
        });
      });

      describe(`when any expression doesn't match`, () => {
        it(`reports match failure`, () => {
          const parser = generate(`start = "a" "b" "c"`, options);

          expect(parser).toFailToParseLanguage(`dbc`);
          expect(parser).toFailToParseLanguage(`adc`);
          expect(parser).toFailToParseLanguage(`abd`);
        });

        it(`resets parse position`, () => {
          const parser = generate(`start = "a" "b" / "a"`, options);

          expect(parser).toParseLanguage(`a`, `a`);
        });
      });
    });

    describe(`action`, () => {
      describe(`when the expression matches`, () => {
        it(`returns the value returned by the code`, () => {
          const parser = generate(`start = "a" { return 42; }`, options);

          expect(parser).toParseLanguage(`a`, 42);
        });

        describe(`label variables`, () => {
          describe(`in the expression`, () => {
            it(`can access variable defined by labeled expression`, () => {
              const parser = generate(`start = a:"a" { return a; }`, options);

              expect(parser).toParseLanguage(`a`, `a`);
            });

            it(`can access variables defined by labeled sequence elements`, () => {
              const parser = generate(
                `start = a:"a" b:"b" c:"c" { return [a, b, c]; }`,
                options,
              );

              expect(parser).toParseLanguage(`abc`, [`a`, `b`, `c`]);
            });

            it(`cannot access variables defined by subexpressions`, () => {
              var testcases = [
                  {
                    grammar: `start = (a:"a") { return a; }`,
                    input: `a`,
                  },
                  {
                    grammar: `start = (a:"a")? { return a; }`,
                    input: `a`,
                  },
                  {
                    grammar: `start = (a:"a")* { return a; }`,
                    input: `a`,
                  },
                  {
                    grammar: `start = (a:"a")+ { return a; }`,
                    input: `a`,
                  },
                  {
                    grammar: `start = $(a:"a") { return a; }`,
                    input: `a`,
                  },
                  {
                    grammar: `start = &(a:"a") "a" { return a; }`,
                    input: `a`,
                  },
                  {
                    grammar: `start = !(a:"a") "b" { return a; }`,
                    input: `b`,
                  },
                  {
                    grammar: `start = b:(a:"a") { return a; }`,
                    input: `a`,
                  },
                  {
                    grammar: `start = ("a" b:"b" "c") { return b; }`,
                    input: `abc`,
                  },
                  {
                    grammar: `start = (a:"a" { return a; }) { return a; }`,
                    input: `a`,
                  },
                  {
                    grammar: `start = ("a" / b:"b" / "c") { return b; }`,
                    input: `b`,
                  },
                ],
                parser, i;

              for (i = 0; i < testcases.length; i++) {
                parser = generate(testcases[i].grammar, options);
                expect(parser).toFailToParseLanguage(testcases[i].input);
              }
            });
          });

          describe(`in outer sequence`, () => {
            it(`can access variables defined by preceding labeled elements`, () => {
              const parser = generate(
                `start = a:"a" b:("b" { return a; })`,
                options,
              );

              expect(parser).toParseLanguage(`ab`, {a: `a`, b: `a`});
            });

            it(`cannot access variable defined by labeled action element`, () => {
              const parser = generate(
                `start = "a" b:("b" { return b; }) c:"c"`,
                options,
              );

              expect(parser).toFailToParseLanguage(`abc`);
            });

            it(`cannot access variables defined by following labeled elements`, () => {
              const parser = generate(
                `start = ("a" { return b; }) b:"b"`,
                options,
              );

              expect(parser).toFailToParseLanguage(`ab`);
            });
          });
        });

        describe(`initializer variables & functions`, () => {
          it(`can access variables defined in the initializer`, () => {
            const parser = generate([
              `{ var v = 42 }`,
              `start = "a" { return v; }`,
            ].join(`\n`), options);

            expect(parser).toParseLanguage(`a`, 42);
          });

          it(`can access functions defined in the initializer`, () => {
            const parser = generate([
              `{ function f() { return 42; } }`,
              `start = "a" { return f(); }`,
            ].join(`\n`), options);

            expect(parser).toParseLanguage(`a`, 42);
          });
        });

        describe(`available variables & functions`, () => {
          it(`|options| contains options`, () => {
            const parser = generate(
              `start = "a" { return options; }`,
              options,
            );

            expect(parser).toParseLanguage(`a`, {a: 42}, {a: 42});
          });

          it(`|text| returns text matched by the expression`, () => {
            const parser = generate(
              `start = "a" { return text(); }`,
              options,
            );

            expect(parser).toParseLanguage(`a`, `a`);
          });

          it(`|location| returns location info of the expression`, () => {
            const parser = generate([
              `{ var result; }`,
              `start  = line (nl+ line)* { return result; }`,
              `line   = thing (" "+ thing)*`,
              `thing  = digit / mark`,
              `digit  = [0-9]`,
              `mark   = "x" { result = location(); }`,
              `nl     = "\\r"? "\\n"`,
            ].join(`\n`), options);

            expect(parser).toParseLanguage(`1\n2\n\n3\n\n\n4 5 x`, {
              start: {offset: 13, line: 7, column: 5},
              end: {offset: 14, line: 7, column: 6},
            });

            /* Newline representations */
            expect(parser).toParseLanguage(`1\nx`, {     // Unix
              start: {offset: 2, line: 2, column: 1},
              end: {offset: 3, line: 2, column: 2},
            });
            expect(parser).toParseLanguage(`1\r\nx`, {   // Windows
              start: {offset: 3, line: 2, column: 1},
              end: {offset: 4, line: 2, column: 2},
            });
          });

          describe(`|expected|`, () => {
            it(`terminates parsing and throws an exception`, () => {
              const parser = generate(
                `start = "a" { expected("a"); }`,
                options,
              );

              expect(parser).toFailToParseLanguage(`a`, {
                message: `Expected a but "a" found.`,
                expected: [{type: `other`, description: `a`}],
                found: `a`,
                location: {
                  start: {offset: 0, line: 1, column: 1},
                  end: {offset: 1, line: 1, column: 2},
                },
              });
            });

            it(`allows to set custom location info`, () => {
              const parser = generate([
                `start = "a" {`,
                `  expected("a", {`,
                `    start: { offset: 1, line: 1, column: 2 },`,
                `    end:   { offset: 2, line: 1, column: 3 }`,
                `  });`,
                `}`,
              ].join(`\n`), options);

              expect(parser).toFailToParseLanguage(`a`, {
                message: `Expected a but "a" found.`,
                expected: [{type: `other`, description: `a`}],
                found: `a`,
                location: {
                  start: {offset: 1, line: 1, column: 2},
                  end: {offset: 2, line: 1, column: 3},
                },
              });
            });
          });

          describe(`|error|`, () => {
            it(`terminates parsing and throws an exception`, () => {
              const parser = generate(
                `start = "a" { error("a"); }`,
                options,
              );

              expect(parser).toFailToParseLanguage(`a`, {
                message: `a`,
                found: null,
                expected: null,
                location: {
                  start: {offset: 0, line: 1, column: 1},
                  end: {offset: 1, line: 1, column: 2},
                },
              });
            });

            it(`allows to set custom location info`, () => {
              const parser = generate([
                `start = "a" {`,
                `  error("a", {`,
                `    start: { offset: 1, line: 1, column: 2 },`,
                `    end:   { offset: 2, line: 1, column: 3 }`,
                `  });`,
                `}`,
              ].join(`\n`), options);

              expect(parser).toFailToParseLanguage(`a`, {
                message: `a`,
                expected: null,
                found: null,
                location: {
                  start: {offset: 1, line: 1, column: 2},
                  end: {offset: 2, line: 1, column: 3},
                },
              });
            });
          });
        });
      });

      describe(`when the expression doesn't match`, () => {
        it(`reports match failure`, () => {
          const parser = generate(`start = "a" { return 42; }`, options);

          expect(parser).toFailToParseLanguage(`b`);
        });

        it(`doesn't execute the code`, () => {
          const parser = generate(
            `start = "a" { throw "Boom!"; } / "b"`,
            options,
          );

          expect(parser).toParseLanguage(`b`);
        });
      });
    });

    describe(`choice`, () => {
      describe(`when any expression matches`, () => {
        it(`returns its match result`, () => {
          const parser = generate(`start = "a" / "b" / "c"`, options);

          expect(parser).toParseLanguage(`a`, `a`);
          expect(parser).toParseLanguage(`b`, `b`);
          expect(parser).toParseLanguage(`c`, `c`);
        });
      });

      describe(`when all expressions don't match`, () => {
        it(`reports match failure`, () => {
          const parser = generate(`start = "a" / "b" / "c"`, options);

          expect(parser).toFailToParseLanguage(`d`);
        });
      });
    });

    describe(`error reporting`, () => {
      describe(`behavior`, () => {
        it(`reports only the rightmost error`, () => {
          const parser = generate(`start = "a" "b" / "a" "c" "d"`, options);

          expect(parser).toFailToParseLanguage(`ace`, {
            expected: [{type: `literal`, text: `d`, ignoreCase: false}],
          });
        });
      });

      describe(`expectations reporting`, () => {
        it(`reports expectations correctly with no alternative`, () => {
          const parser = generate(`start = "a"`, options);

          expect(parser).toFailToParseLanguage(`ab`, {
            expected: [{type: `end`}],
          });
        });

        it(`reports expectations correctly with one alternative`, () => {
          const parser = generate(`start = "a"`, options);

          expect(parser).toFailToParseLanguage(`b`, {
            expected: [{type: `literal`, text: `a`, ignoreCase: false}],
          });
        });

        it(`reports expectations correctly with multiple alternatives`, () => {
          const parser = generate(`start = "a" / "b" / "c"`, options);

          expect(parser).toFailToParseLanguage(`d`, {
            expected: [
              {type: `literal`, text: `a`, ignoreCase: false},
              {type: `literal`, text: `b`, ignoreCase: false},
              {type: `literal`, text: `c`, ignoreCase: false},
            ],
          });
        });
      });

      describe(`found string reporting`, () => {
        it(`reports found string correctly at the end of input`, () => {
          const parser = generate(`start = "a"`, options);

          expect(parser).toFailToParseLanguage(``, {found: null});
        });

        it(`reports found string correctly in the middle of input`, () => {
          const parser = generate(`start = "a"`, options);

          expect(parser).toFailToParseLanguage(`b`, {found: `b`});
        });
      });

      describe(`message building`, () => {
        it(`builds message correctly with no alternative`, () => {
          const parser = generate(`start = "a"`, options);

          expect(parser).toFailToParseLanguage(`ab`, {
            message: `Expected end of input but "b" found.`,
          });
        });

        it(`builds message correctly with one alternative`, () => {
          const parser = generate(`start = "a"`, options);

          expect(parser).toFailToParseLanguage(`b`, {
            message: `Expected "a" but "b" found.`,
          });
        });

        it(`builds message correctly with multiple alternatives`, () => {
          const parser = generate(`start = "a" / "b" / "c"`, options);

          expect(parser).toFailToParseLanguage(`d`, {
            message: `Expected "a", "b", or "c" but "d" found.`,
          });
        });

        it(`builds message correctly at the end of input`, () => {
          const parser = generate(`start = "a"`, options);

          expect(parser).toFailToParseLanguage(``, {
            message: `Expected "a" but end of input found.`,
          });
        });

        it(`builds message correctly in the middle of input`, () => {
          const parser = generate(`start = "a"`, options);

          expect(parser).toFailToParseLanguage(`b`, {
            message: `Expected "a" but "b" found.`,
          });
        });

        it(`removes duplicates from expectations`, () => {
          const parser = generate(`start = "a" / "a"`, options);

          expect(parser).toFailToParseLanguage(`b`, {
            message: `Expected "a" but "b" found.`,
          });
        });

        it(`sorts expectations`, () => {
          const parser = generate(`start = "c" / "b" / "a"`, options);

          expect(parser).toFailToParseLanguage(`d`, {
            message: `Expected "a", "b", or "c" but "d" found.`,
          });
        });
      });

      describe(`position reporting`, () => {
        it(`reports position correctly at the end of input`, () => {
          const parser = generate(`start = "a"`, options);

          expect(parser).toFailToParseLanguage(``, {
            location: {
              start: {offset: 0, line: 1, column: 1},
              end: {offset: 0, line: 1, column: 1},
            },
          });
        });

        it(`reports position correctly in the middle of input`, () => {
          const parser = generate(`start = "a"`, options);

          expect(parser).toFailToParseLanguage(`b`, {
            location: {
              start: {offset: 0, line: 1, column: 1},
              end: {offset: 1, line: 1, column: 2},
            },
          });
        });

        it(`reports position correctly with trailing input`, () => {
          const parser = generate(`start = "a"`, options);

          expect(parser).toFailToParseLanguage(`aa`, {
            location: {
              start: {offset: 1, line: 1, column: 2},
              end: {offset: 2, line: 1, column: 3},
            },
          });
        });

        it(`reports position correctly in complex cases`, () => {
          const parser = generate([
            `start  = line (nl+ line)*`,
            `line   = digit (" "+ digit)*`,
            `digit  = [0-9]`,
            `nl     = "\\r"? "\\n"`,
          ].join(`\n`), options);

          expect(parser).toFailToParseLanguage(`1\n2\n\n3\n\n\n4 5 x`, {
            location: {
              start: {offset: 13, line: 7, column: 5},
              end: {offset: 14, line: 7, column: 6},
            },
          });

          /* Newline representations */
          expect(parser).toFailToParseLanguage(`1\nx`, {     // Old Mac
            location: {
              start: {offset: 2, line: 2, column: 1},
              end: {offset: 3, line: 2, column: 2},
            },
          });
          expect(parser).toFailToParseLanguage(`1\r\nx`, {   // Windows
            location: {
              start: {offset: 3, line: 2, column: 1},
              end: {offset: 4, line: 2, column: 2},
            },
          });
        });
      });
    });

    /*
     * Following examples are from Wikipedia, see
     * http://en.wikipedia.org/w/index.php?title=Parsing_expression_grammar&oldid=335106938.
     */
    describe(`complex examples`, () => {
      it(`handles arithmetics example correctly`, () => {
        /*
         * Value   ← [0-9]+ / '(' Expr ')'
         * Product ← Value (('*' / '/') Value)*
         * Sum     ← Product (('+' / '-') Product)*
         * Expr    ← Sum
         */
        const parser = generate([
          `Expr    = Sum`,
          `Sum     = first:Product rest:(("+" / "-") Product)* {`,
          `            var result = first, i;`,
          `            for (i = 0; i < rest.length; i++) {`,
          `              if (rest[i][0] == "+") { result += rest[i][1]; }`,
          `              if (rest[i][0] == "-") { result -= rest[i][1]; }`,
          `            }`,
          `            return result;`,
          `          }`,
          `Product = first:Value rest:(("*" / "/") Value)* {`,
          `            var result = first, i;`,
          `            for (i = 0; i < rest.length; i++) {`,
          `              if (rest[i][0] == "*") { result *= rest[i][1]; }`,
          `              if (rest[i][0] == "/") { result /= rest[i][1]; }`,
          `            }`,
          `            return result;`,
          `          }`,
          `Value   = digits:[0-9]+     { return parseInt(digits.join(""), 10); }`,
          `        / "(" expr:Expr ")" { return expr; }`,
        ].join(`\n`), options);

        /* The "value" rule */
        expect(parser).toParseLanguage(`0`,       0);
        expect(parser).toParseLanguage(`123`,     123);
        expect(parser).toParseLanguage(`(42+43)`, 42 + 43);

        /* The "product" rule */
        expect(parser).toParseLanguage(`42`,          42);
        expect(parser).toParseLanguage(`42*43`,       42 * 43);
        expect(parser).toParseLanguage(`42*43*44*45`, 42 * 43 * 44 * 45);
        expect(parser).toParseLanguage(`42/43`,       42 / 43);
        expect(parser).toParseLanguage(`42/43/44/45`, 42 / 43 / 44 / 45);

        /* The "sum" rule */
        expect(parser).toParseLanguage(`42*43`,                   42 * 43);
        expect(parser).toParseLanguage(`42*43+44*45`,             42 * 43 + 44 * 45);
        expect(parser).toParseLanguage(`42*43+44*45+46*47+48*49`, 42 * 43 + 44 * 45 + 46 * 47 + 48 * 49);
        expect(parser).toParseLanguage(`42*43-44*45`,             42 * 43 - 44 * 45);
        expect(parser).toParseLanguage(`42*43-44*45-46*47-48*49`, 42 * 43 - 44 * 45 - 46 * 47 - 48 * 49);

        /* The "expr" rule */
        expect(parser).toParseLanguage(`42+43`, 42 + 43);

        /* Complex test */
        expect(parser).toParseLanguage(`(1+2)*(3+4)`, (1 + 2) * (3 + 4));
      });

      it(`handles non-context-free language correctly`, () => {
        /* The following parsing expression grammar describes the classic
         * non-context-free language { a^n b^n c^n : n >= 1 }:
         *
         * S ← &(A c) a+ B !(a/b/c)
         * A ← a A? b
         * B ← b B? c
         */
        const parser = generate([
          `S = &(A "c") a:"a"+ B:B !("a" / "b" / "c") { return a.join("") + B; }`,
          `A = a:"a" A:A? b:"b" { return [a, A, b].join(""); }`,
          `B = b:"b" B:B? c:"c" { return [b, B, c].join(""); }`,
        ].join(`\n`), options);

        expect(parser).toParseLanguage(`abc`,       `abc`);
        expect(parser).toParseLanguage(`aaabbbccc`, `aaabbbccc`);
        expect(parser).toFailToParseLanguage(`aabbbccc`);
        expect(parser).toFailToParseLanguage(`aaaabbbccc`);
        expect(parser).toFailToParseLanguage(`aaabbccc`);
        expect(parser).toFailToParseLanguage(`aaabbbbccc`);
        expect(parser).toFailToParseLanguage(`aaabbbcc`);
        expect(parser).toFailToParseLanguage(`aaabbbcccc`);
      });

      it(`handles nested comments example correctly`, () => {
        /*
         * Begin ← "(*"
         * End ← "*)"
         * C ← Begin N* End
         * N ← C / (!Begin !End Z)
         * Z ← any single character
         */
        const parser = generate([
          `C     = begin:Begin ns:N* end:End { return begin + ns.join("") + end; }`,
          `N     = C`,
          `      / !Begin !End z:Z { return z; }`,
          `Z     = .`,
          `Begin = "(*"`,
          `End   = "*)"`,
        ].join(`\n`), options);

        expect(parser).toParseLanguage(`(**)`,     `(**)`);
        expect(parser).toParseLanguage(`(*abc*)`,  `(*abc*)`);
        expect(parser).toParseLanguage(`(*(**)*)`, `(*(**)*)`);
        expect(parser).toParseLanguage(
          `(*abc(*def*)ghi(*(*(*jkl*)*)*)mno*)`,
          `(*abc(*def*)ghi(*(*(*jkl*)*)*)mno*)`,
        );
      });
    });
  });
});
