import {compiler} from 'arpege';

import './helpers';

describe(`compiler pass |generateBytecode|`, () => {
  const {generateBytecode} = compiler.passes.generate;

  function bytecodeDetails(bytecode: Array<number>) {
    return {
      rules: [{bytecode}],
    };
  }

  function constsDetails(consts: Array<string>) {
    return {consts};
  }

  describe(`for grammar`, () => {
    it(`generates correct bytecode`, () => {
      expect(generateBytecode).toChangeAST([
        `a = "a"`,
        `b = "b"`,
        `c = "c"`,
      ].join(`\n`), {
        rules: [
          {bytecode: [19, 0, 2, 2, 23, 0, 24, 1]},
          {bytecode: [19, 2, 2, 2, 23, 2, 24, 3]},
          {bytecode: [19, 4, 2, 2, 23, 4, 24, 5]},
        ],
      });
    });

    it(`defines correct constants`, () => {
      expect(generateBytecode).toChangeAST([
        `a = "a"`,
        `b = "b"`,
        `c = "c"`,
      ].join(`\n`), constsDetails([
        `"a"`,
        `peg$literalExpectation("a", false)`,
        `"b"`,
        `peg$literalExpectation("b", false)`,
        `"c"`,
        `peg$literalExpectation("c", false)`,
      ]));
    });
  });

  describe(`for rule`, () => {
    it(`generates correct bytecode`, () => {
      expect(generateBytecode).toChangeAST(`start = "a"`, bytecodeDetails([
        19, 0, 2, 2, 23, 0, 24, 1,   // <expression>
      ]));
    });
  });

  describe(`for named`, () => {
    var grammar = `start "start" = "a"`;

    it(`generates correct bytecode`, () => {
      expect(generateBytecode).toChangeAST(grammar, bytecodeDetails([
        29,                          // SILENT_FAILS_ON
        19, 1, 2, 2, 23, 1, 24, 2,   // <expression>
        30,                          // SILENT_FAILS_OFF
        14, 2, 0,                    // IF_ERROR
        24, 0,                        //   * FAIL
      ]));
    });

    it(`defines correct constants`, () => {
      expect(generateBytecode).toChangeAST(grammar, constsDetails([
        `peg$otherExpectation("start")`,
        `"a"`,
        `peg$literalExpectation("a", false)`,
      ]));
    });
  });

  describe(`for choice`, () => {
    it(`generates correct bytecode`, () => {
      expect(generateBytecode).toChangeAST(`start = "a" / "b" / "c"`, bytecodeDetails([
        19, 0, 2, 2, 23, 0, 24, 1,   // <alternatives[0]>
        14, 21, 0,                   // IF_ERROR
        6,                           //   * POP
        19, 2, 2, 2, 23, 2, 24, 3,   //     <alternatives[1]>
        14, 9, 0,                    //     IF_ERROR
        6,                           //       * POP
        19, 4, 2, 2, 23, 4, 24, 5,   //         <alternatives[2]>
      ]));
    });
  });

  describe(`for action`, () => {
    describe(`without labels`, () => {
      var grammar = `start = "a" { code }`;

      it(`generates correct bytecode`, () => {
        expect(generateBytecode).toChangeAST(grammar, bytecodeDetails([
          5,                           // PUSH_CURR_POS
          19, 0, 2, 2, 23, 0, 24, 1,   // <expression>
          15, 6, 0,                    // IF_NOT_ERROR
          25, 1,                       //   * LOAD_SAVED_POS
          27, 2, 1, 0,                 //     CALL
          9,                            // NIP
        ]));
      });

      it(`defines correct constants`, () => {
        expect(generateBytecode).toChangeAST(grammar, constsDetails([
          `"a"`,
          `peg$literalExpectation("a", false)`,
          `function() { code }`,
        ]));
      });
    });

    describe(`with one label`, () => {
      var grammar = `start = a:"a" { code }`;

      it(`generates correct bytecode`, () => {
        expect(generateBytecode).toChangeAST(grammar, bytecodeDetails([
          5,                           // PUSH_CURR_POS
          19, 0, 2, 2, 23, 0, 24, 1,   // <expression>
          15, 7, 0,                    // IF_NOT_ERROR
          25, 1,                       //   * LOAD_SAVED_POS
          27, 2, 1, 1, 0,              //     CALL
          9,                            // NIP
        ]));
      });

      it(`defines correct constants`, () => {
        expect(generateBytecode).toChangeAST(grammar, constsDetails([
          `"a"`,
          `peg$literalExpectation("a", false)`,
          `function(a) { code }`,
        ]));
      });
    });

    describe(`with multiple labels`, () => {
      var grammar = `start = a:"a" b:"b" c:"c" { code }`;

      it(`generates correct bytecode`, () => {
        expect(generateBytecode).toChangeAST(grammar, bytecodeDetails([
          5,                           // PUSH_CURR_POS
          19, 0, 2, 2, 23, 0, 24, 1,   // <elements[0]>
          15, 40, 3,                   // IF_NOT_ERROR
          19, 2, 2, 2, 23, 2, 24, 3,   //   * <elements[1]>
          15, 25, 4,                   //     IF_NOT_ERROR
          19, 4, 2, 2, 23, 4, 24, 5,   //       * <elements[2]>
          15, 10, 4,                   //         IF_NOT_ERROR
          25, 3,                       //           * LOAD_SAVED_POS
          27, 6, 3, 3, 2, 1, 0,        //             CALL
          9,                           //             NIP
          8, 3,                        //           * POP_N
          7,                           //             POP_CURR_POS
          3,                           //             PUSH_FAILED
          8, 2,                        //       * POP_N
          7,                           //         POP_CURR_POS
          3,                           //         PUSH_FAILED
          6,                           //   * POP
          7,                           //     POP_CURR_POS
          3,                            //     PUSH_FAILED
        ]));
      });

      it(`defines correct constants`, () => {
        expect(generateBytecode).toChangeAST(grammar, constsDetails([
          `"a"`,
          `peg$literalExpectation("a", false)`,
          `"b"`,
          `peg$literalExpectation("b", false)`,
          `"c"`,
          `peg$literalExpectation("c", false)`,
          `function(a, b, c) { code }`,
        ]));
      });
    });
  });

  describe(`for sequence`, () => {
    var grammar = `start = "a" "b" "c"`;

    it(`generates correct bytecode`, () => {
      expect(generateBytecode).toChangeAST(grammar, bytecodeDetails([
        5,                           // PUSH_CURR_POS
        19, 0, 2, 2, 23, 0, 24, 1,   // <elements[0]>
        15, 33, 3,                   // IF_NOT_ERROR
        19, 2, 2, 2, 23, 2, 24, 3,   //   * <elements[1]>
        15, 18, 4,                   //     IF_NOT_ERROR
        19, 4, 2, 2, 23, 4, 24, 5,   //       * <elements[2]>
        15, 3, 4,                    //         IF_NOT_ERROR
        11, 3,                       //           * WRAP
        9,                           //             NIP
        8, 3,                        //           * POP_N
        7,                           //             POP_CURR_POS
        3,                           //             PUSH_FAILED
        8, 2,                        //       * POP_N
        7,                           //         POP_CURR_POS
        3,                           //         PUSH_FAILED
        6,                           //   * POP
        7,                           //     POP_CURR_POS
        3,                           //     PUSH_FAILED
      ]));
    });

    it(`defines correct constants`, () => {
      expect(generateBytecode).toChangeAST(grammar, constsDetails([
        `"a"`,
        `peg$literalExpectation("a", false)`,
        `"b"`,
        `peg$literalExpectation("b", false)`,
        `"c"`,
        `peg$literalExpectation("c", false)`,
      ]));
    });
  });

  describe(`for labeled`, () => {
    it(`generates correct bytecode`, () => {
      expect(generateBytecode).toChangeAST(`start = a:"a"`, bytecodeDetails([
        19, 0, 2, 2, 23, 0, 24, 1,   // <expression>
      ]));
    });
  });

  describe(`for text`, () => {
    it(`generates correct bytecode`, () => {
      expect(generateBytecode).toChangeAST(`start = $"a"`, bytecodeDetails([
        5,                           // PUSH_CURR_POS
        19, 0, 2, 2, 23, 0, 24, 1,   // <expression>
        15, 2, 1,                    // IF_NOT_ERROR
        6,                           //   * POP
        12,                          //     TEXT
        9,                            //   * NIP
      ]));
    });
  });

  describe(`for simple_and`, () => {
    var grammar = `start = &"a"`;

    it(`generates correct bytecode`, () => {
      expect(generateBytecode).toChangeAST(grammar, bytecodeDetails([
        5,                           // PUSH_CURR_POS
        29,                          // SILENT_FAILS_ON
        19, 0, 2, 2, 23, 0, 24, 1,   // <expression>
        30,                          // SILENT_FAILS_OFF
        15, 3, 3,                    // IF_NOT_ERROR
        6,                           //   * POP
        7,                           //     POP_CURR_POS
        1,                           //     PUSH_UNDEFINED
        6,                           //   * POP
        6,                           //     POP
        3,                           //     PUSH_FAILED
      ]));
    });

    it(`defines correct constants`, () => {
      expect(generateBytecode).toChangeAST(grammar, constsDetails([
        `"a"`,
        `peg$literalExpectation("a", false)`,
      ]));
    });
  });

  describe(`for simple_not`, () => {
    var grammar = `start = !"a"`;

    it(`generates correct bytecode`, () => {
      expect(generateBytecode).toChangeAST(grammar, bytecodeDetails([
        5,                           // PUSH_CURR_POS
        29,                          // SILENT_FAILS_ON
        19, 0, 2, 2, 23, 0, 24, 1,   // <expression>
        30,                          // SILENT_FAILS_OFF
        14, 3, 3,                    // IF_ERROR
        6,                           //   * POP
        6,                           //     POP
        1,                           //     PUSH_UNDEFINED
        6,                           //   * POP
        7,                           //     POP_CURR_POS
        3,                           //     PUSH_FAILED
      ]));
    });

    it(`defines correct constants`, () => {
      expect(generateBytecode).toChangeAST(grammar, constsDetails([
        `"a"`,
        `peg$literalExpectation("a", false)`,
      ]));
    });
  });

  describe(`for optional`, () => {
    var grammar = `start = "a"?`;

    it(`generates correct bytecode`, () => {
      expect(generateBytecode).toChangeAST(grammar, bytecodeDetails([
        19, 0, 2, 2, 23, 0, 24, 1,   // <expression>
        14, 2, 0,                    // IF_ERROR
        6,                           //   * POP
        2,                           //    PUSH_NULL
      ]));
    });

    it(`defines correct constants`, () => {
      expect(generateBytecode).toChangeAST(grammar, constsDetails([
        `"a"`,
        `peg$literalExpectation("a", false)`,
      ]));
    });
  });

  describe(`for zeroOrMore`, () => {
    var grammar = `start = "a"*`;

    it(`generates correct bytecode`, () => {
      expect(generateBytecode).toChangeAST(grammar, bytecodeDetails([
        4,                           // PUSH_EMPTY_ARRAY
        19, 0, 2, 2, 23, 0, 24, 1,   // <expression>
        16, 9,                       // WHILE_NOT_ERROR
        10,                          //   * APPEND
        19, 0, 2, 2, 23, 0, 24, 1,   //     <expression>
        6,                           // POP
      ]));
    });

    it(`defines correct constants`, () => {
      expect(generateBytecode).toChangeAST(grammar, constsDetails([
        `"a"`,
        `peg$literalExpectation("a", false)`,
      ]));
    });
  });

  describe(`for oneOrMore`, () => {
    var grammar = `start = "a"+`;

    it(`generates correct bytecode`, () => {
      expect(generateBytecode).toChangeAST(grammar, bytecodeDetails([
        4,                           // PUSH_EMPTY_ARRAY
        19, 0, 2, 2, 23, 0, 24, 1,   // <expression>
        15, 12, 3,                   // IF_NOT_ERROR
        16, 9,                       //   * WHILE_NOT_ERROR
        10,                          //       * APPEND
        19, 0, 2, 2, 23, 0, 24, 1,   //         <expression>
        6,                           //     POP
        6,                           //   * POP
        6,                           //     POP
        3,                           //     PUSH_FAILED
      ]));
    });

    it(`defines correct constants`, () => {
      expect(generateBytecode).toChangeAST(grammar, constsDetails([
        `"a"`,
        `peg$literalExpectation("a", false)`,
      ]));
    });
  });

  describe(`for group`, () => {
    it(`generates correct bytecode`, () => {
      expect(generateBytecode).toChangeAST(`start = ("a")`, bytecodeDetails([
        19, 0, 2, 2, 23, 0, 24, 1,   // <expression>
      ]));
    });
  });

  describe(`for semanticAnd`, () => {
    describe(`without labels`, () => {
      var grammar = `start = &{ code }`;

      it(`generates correct bytecode`, () => {
        expect(generateBytecode).toChangeAST(grammar, bytecodeDetails([
          26,            // UPDATE_SAVED_POS
          27, 0, 0, 0,   // CALL
          13, 2, 2,      // IF
          6,             //   * POP
          1,             //     PUSH_UNDEFINED
          6,             //   * POP
          3,             //     PUSH_FAILED
        ]));
      });

      it(`defines correct constants`, () => {
        expect(generateBytecode).toChangeAST(
          grammar,
          constsDetails([`function() { code }`]),
        );
      });
    });

    describe(`with labels`, () => {
      var grammar = `start = a:"a" b:"b" c:"c" &{ code }`;

      it(`generates correct bytecode`, () => {
        expect(generateBytecode).toChangeAST(grammar, bytecodeDetails([
          5,                           // PUSH_CURR_POS
          19, 0, 2, 2, 23, 0, 24, 1,   // <elements[0]>
          15, 62, 3,                   // IF_NOT_ERROR
          19, 2, 2, 2, 23, 2, 24, 3,   //   * <elements[1]>
          15, 47, 4,                   //     IF_NOT_ERROR
          19, 4, 2, 2, 23, 4, 24, 5,   //       * <elements[2]>
          15, 32, 4,                   //         IF_NOT_ERROR
          26,                          //           * UPDATE_SAVED_POS
          27, 6, 0, 3, 2, 1, 0,        //             CALL
          13, 2, 2,                    //             IF
          6,                           //               * POP
          1,                           //                 PUSH_UNDEFINED
          6,                           //               * POP
          3,                           //                 PUSH_FAILED
          15, 10, 4,                   //             IF_NOT_ERROR
          25, 4,                       //               * LOAD_SAVED_POS
          27, 7, 4, 3, 3, 2, 1,        //                 CALL
          9,                           //                 NIP
          8, 4,                        //               * POP_N
          7,                           //                 POP_CURR_POS
          3,                           //                 PUSH_FAILED
          8, 3,                        //           * POP_N
          7,                           //             POP_CURR_POS
          3,                           //             PUSH_FAILED
          8, 2,                        //       * POP_N
          7,                           //         POP_CURR_POS
          3,                           //         PUSH_FAILED
          6,                           //   * POP
          7,                           //     POP_CURR_POS
          3,                           //     PUSH_FAILED
        ]));
      });

      it(`defines correct constants`, () => {
        expect(generateBytecode).toChangeAST(grammar, constsDetails([
          `"a"`,
          `peg$literalExpectation("a", false)`,
          `"b"`,
          `peg$literalExpectation("b", false)`,
          `"c"`,
          `peg$literalExpectation("c", false)`,
          `function(a, b, c) { code }`,
          `function(a, b, c) {return {a, b, c}}`,
        ]));
      });
    });
  });

  describe(`for semanticNot`, () => {
    describe(`without labels`, () => {
      var grammar = `start = !{ code }`;

      it(`generates correct bytecode`, () => {
        expect(generateBytecode).toChangeAST(grammar, bytecodeDetails([
          26,            // UPDATE_SAVED_POS
          27, 0, 0, 0,   // CALL
          13, 2, 2,      // IF
          6,             //   * POP
          3,             //     PUSH_FAILED
          6,             //   * POP
          1,             //     PUSH_UNDEFINED
        ]));
      });

      it(`defines correct constants`, () => {
        expect(generateBytecode).toChangeAST(
          grammar,
          constsDetails([`function() { code }`]),
        );
      });
    });

    describe(`with labels`, () => {
      var grammar = `start = a:"a" b:"b" c:"c" !{ code }`;

      it(`generates correct bytecode`, () => {
        expect(generateBytecode).toChangeAST(grammar, bytecodeDetails([
          5,                           // PUSH_CURR_POS
          19, 0, 2, 2, 23, 0, 24, 1,   // <elements[0]>
          15, 62, 3,                   // IF_NOT_ERROR
          19, 2, 2, 2, 23, 2, 24, 3,   //   * <elements[1]>
          15, 47, 4,                   //     IF_NOT_ERROR
          19, 4, 2, 2, 23, 4, 24, 5,   //       * <elements[2]>
          15, 32, 4,                   //         IF_NOT_ERROR
          26,                          //           * UPDATE_SAVED_POS
          27, 6, 0, 3, 2, 1, 0,        //             CALL
          13, 2, 2,                    //             IF
          6,                           //               * POP
          3,                           //                 PUSH_FAILED
          6,                           //               * POP
          1,                           //                 PUSH_UNDEFINED
          15, 10, 4,                   //             IF_NOT_ERROR
          25, 4,                       //               * LOAD_SAVED_POS
          27, 7, 4, 3, 3, 2, 1,        //                 CALL
          9,                           //                 NIP
          8, 4,                        //               * POP_N
          7,                           //                 POP_CURR_POS
          3,                           //                 PUSH_FAILED
          8, 3,                        //           * POP_N
          7,                           //             POP_CURR_POS
          3,                           //             PUSH_FAILED
          8, 2,                        //       * POP_N
          7,                           //         POP_CURR_POS
          3,                           //         PUSH_FAILED
          6,                           //   * POP
          7,                           //     POP_CURR_POS
          3,                           //     PUSH_FAILED
        ]));
      });

      it(`defines correct constants`, () => {
        expect(generateBytecode).toChangeAST(grammar, constsDetails([
          `"a"`,
          `peg$literalExpectation("a", false)`,
          `"b"`,
          `peg$literalExpectation("b", false)`,
          `"c"`,
          `peg$literalExpectation("c", false)`,
          `function(a, b, c) { code }`,
          `function(a, b, c) {return {a, b, c}}`,
        ]));
      });
    });
  });

  describe(`for ruleRef`, () => {
    it(`generates correct bytecode`, () => {
      expect(generateBytecode).toChangeAST([
        `start = other`,
        `other = "other"`,
      ].join(`\n`), {
        rules: [
          {
            bytecode: [28, 1],   // RULE
          },
          { },
        ],
      });
    });
  });

  describe(`for literal`, () => {
    describe(`empty`, () => {
      var grammar = `start = ""`;

      it(`generates correct bytecode`, () => {
        expect(generateBytecode).toChangeAST(grammar, bytecodeDetails([
          0, 0,   // PUSH
        ]));
      });

      it(`defines correct constants`, () => {
        expect(generateBytecode).toChangeAST(grammar, constsDetails([`""`]));
      });
    });

    describe(`non-empty case-sensitive`, () => {
      var grammar = `start = "a"`;

      it(`generates correct bytecode`, () => {
        expect(generateBytecode).toChangeAST(grammar, bytecodeDetails([
          19, 0, 2, 2,   // MATCH_STRING
          23, 0,         //   * ACCEPT_STRING
          24, 1,         //   * FAIL
        ]));
      });

      it(`defines correct constants`, () => {
        expect(generateBytecode).toChangeAST(grammar, constsDetails([
          `"a"`,
          `peg$literalExpectation("a", false)`,
        ]));
      });
    });

    describe(`non-empty case-insensitive`, () => {
      var grammar = `start = "A"i`;

      it(`generates correct bytecode`, () => {
        expect(generateBytecode).toChangeAST(grammar, bytecodeDetails([
          20, 0, 2, 2,   // MATCH_STRING_IC
          22, 1,         //   * ACCEPT_N
          24, 1,         //   * FAIL
        ]));
      });

      it(`defines correct constants`, () => {
        expect(generateBytecode).toChangeAST(grammar, constsDetails([
          `"a"`,
          `peg$literalExpectation("A", true)`,
        ]));
      });
    });
  });

  describe(`for class`, () => {
    it(`generates correct bytecode`, () => {
      expect(generateBytecode).toChangeAST(`start = [a]`, bytecodeDetails([
        21, 0, 2, 2,   // MATCH_REGEXP
        22, 1,         //   * ACCEPT_N
        24, 1,         //   * FAIL
      ]));
    });

    describe(`non-empty non-inverted case-sensitive`, () => {
      it(`defines correct constants`, () => {
        expect(generateBytecode).toChangeAST(`start = [a]`, constsDetails([
          `/^[a]/`,
          `peg$classExpectation(["a"], false, false)`,
        ]));
      });
    });

    describe(`non-empty inverted case-sensitive`, () => {
      it(`defines correct constants`, () => {
        expect(generateBytecode).toChangeAST(`start = [^a]`, constsDetails([
          `/^[^a]/`,
          `peg$classExpectation(["a"], true, false)`,
        ]));
      });
    });

    describe(`non-empty non-inverted case-insensitive`, () => {
      it(`defines correct constants`, () => {
        expect(generateBytecode).toChangeAST(`start = [a]i`, constsDetails([
          `/^[a]/i`,
          `peg$classExpectation(["a"], false, true)`,
        ]));
      });
    });

    describe(`non-empty complex`, () => {
      it(`defines correct constants`, () => {
        expect(generateBytecode).toChangeAST(`start = [ab-def-hij-l]`, constsDetails([
          `/^[ab-def-hij-l]/`,
          `peg$classExpectation(["a",["b","d"],"e",["f","h"],"i",["j","l"]], false, false)`,
        ]));
      });
    });

    describe(`empty non-inverted`, () => {
      it(`defines correct constants`, () => {
        expect(generateBytecode).toChangeAST(`start = []`, constsDetails([
          `/^[]/`,
          `peg$classExpectation([], false, false)`,
        ]));
      });
    });

    describe(`empty inverted`, () => {
      it(`defines correct constants`, () => {
        expect(generateBytecode).toChangeAST(`start = [^]`, constsDetails([
          `/^[^]/`,
          `peg$classExpectation([], true, false)`,
        ]));
      });
    });
  });

  describe(`for any`, () => {
    var grammar = `start = .`;

    it(`generates bytecode`, () => {
      expect(generateBytecode).toChangeAST(grammar, bytecodeDetails([
        18, 2, 2,   // MATCH_ANY
        22, 1,      //   * ACCEPT_N
        24, 0,      //   * FAIL
      ]));
    });

    it(`defines correct constants`, () => {
      expect(generateBytecode).toChangeAST(
        grammar,
        constsDetails([`peg$anyExpectation()`]),
      );
    });
  });
});
