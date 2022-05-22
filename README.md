# <img src="./logo.svg" height="25" /> Arpege

> Language parser generator - fork of PegJS

[![npm version](https://img.shields.io/npm/v/arpege.svg)](https://yarnpkg.com/package/arpege) [![Licence](https://img.shields.io/npm/l/arpege.svg)](https://github.com/arcanis/arpege#license-mit) [![Yarn](https://img.shields.io/badge/developed%20with-Yarn%202-blue)](https://github.com/yarnpkg/berry)

**Important note:** My bandwidth is tight, and this project is low in my priorities. I'm open to merge fixes and improvements, but I'm unlikely to investigate issues unless they also affect my own projects. If you have a bug or want to see something, I suggest you to implement a fix yourself. Thanks for the understanding 😃

## Installation

```sh
yarn add arpege
```

## Usage

Arpege can be used similarly to PegJS; at the moment I recommend you to take a look at their [documentation](https://pegjs.org/).

## New features

### SuperSyntax

SuperSyntax is a [VSCode extension](https://marketplace.visualstudio.com/items?itemName=arcanis.supersyntax) that lets you write PegJS grammar to highlight your custom languages. To see an example in practice, add Arpege to your project, install the extension, add the following to your `settings.json` file (the `~` means that the grammar will be retrieved from your dependencies):

```json
{
  "supersyntax.parsers": {
    "math": "~arpege/examples/grammar.math.pegjs"
  }
}
```

Then create a new `my-file.math.stx` file and add a mathematical expression. It'll be automatically colored as per the rules defined in the [grammar](/examples/grammar.css.pegjs)! Note that SuperSyntax also automatically adds support for PegJS syntax highlighting.

### Automatic return values

Arpege will check the labels you assigned into parsing sequences, and generate meaningful return values if you didn't explicitly add one (unlike PegJS, which always returned an array of all elements in the sequence). Three variants are supported:

- If the sequence only contains labeled elements, an object will be created from those labels:

```pegjs
type = "type(" name:identifier ")" nullable:"?"?
  // Returns {name: string, nullable"}
```

- If the sequence only contains anonymous elements, an array will be created from those elements:

```pegjs
type = "type(" ::identifier ")" ::"?"?
  // Returns [string, "?" | null]
```

- If the sequence only contains a single anonymous, its value will be returned as-is

```
identifier = !reservedWord ::identifierString
  // Returns [string]
```

If any of those three variant is detected, all other elements in the parsing sequence will see their results discarded.

### New `@separator` annotation

The `+` and `*` operators now accept a `@separator` annotation that lets you specify an expression to inject between each elements of the repetition:

```pegjs
identifiers =
  @separator(expr: "," S)
  identifier+
```

### Experimental builtin tokenizer

> **Warning**
> 
> This feature isn't compatible with the `cache: true` option.

Arpege can generate a tokenizer for your grammar by adding the `--tokenizer` flag to the command line (note that in this case, the output will be a parser that will return a stream of tokens but won't be able to parse your file as originally intended; in other words, you may have to generate two parsers: one for the regular parsing, and another for the tokenizer).

The tokenizer tries to be smart and automatically detect the places where tokens should be read:

- The `$` operator will turn everything it covers into a single token
- String literals are turned into one token each (`"eval" "("` generates two tokens, `"eval("` a single one)
- Character classes generate one token **for each character**; use `$` to aggregate them into a single token

You can assign custom token types or boundaries by using the `@token` annotation. For example, the following grammar will define a special `decorator` token that will cover both the `@` and the identifier that follows (without the need to use `$`):

```pegjs
Decorator =
  @token(type: `decorator`)
  `@` name:identifier
```

### Experimental TypeScript support

Arpege supports generating `.d.ts` files for your parsers by adding the `--types` flag to the command line. Unlike [`ts-pegjs`](https://github.com/metadevpro/ts-pegjs) which simply makes the `parser` function return `any`, Arpege attempts to return types that match what the actual parser would return, by using some introspection mechanisms.

Because it's often a good idea to avoid using TypeScript syntax within parsers (otherwise your generated parser will have to be transpiled by TypeScript, which will complain about various missing types), Arpege provides a few helpers to workaround some common use cases for TypeScript syntax; those helpers will work regardless of the context and can thus be safely referenced from your grammar actions:

- The `literal(val: string)` helper will preserve the literal value of `val` (for instance, `literal("foo")` will be typed `"foo"` rather than `string`). You should use it when returning values whose string representation matters (for instance in typical ASTs it would be the `type` fields).

- The `tuple(val: [...any])` function will force TypeScript to type the provided input value as a tuple rather than a non-descriptive array (for instance, `tuple(["hello", 42])` will be typed `[string, number]` instead of `Array<string | number>`).

> **Warning**
> 
> Support for this feature is **experimental**. Some bugs may exist, and some APIs may change in the future. The main know problem is that it may generate invalid files if recursion is used. For instance, given the following syntax:
>
> ```pegjs
> Term = Number / "(" ::Term ")"
> Number = [0-9]+ { return parseInt(text(), 10) }
> ```
>
> Arpege will generate the following output:
> 
> ```ts
> type TermType = NumberType | TermType;
> type NumberType = ReturnType<typeof peg$type$action0>;
> ```
>
> TypeScript doesn't support recursive types except in very specific cases, and will degrade `TermType` into `any`. To avoid this, you must use the `@type` annotation which lets you assign a manual type to a node. For example, to ignore the recursive branch, you can manually type it as `never`:
>
> ```ts
> Term = Number / (@type(type: `never`) `(` ::Term `)`)
> Number = [0-9]+ { return parseInt(text(), 10) }
> ```
> 
> The `TermType` type will then become `NumberType | never`, which TypeScript will coalesce into simply `NumberType`. In more complicated cases, you may have to provide more concrete types or even fallback to `unknown` or `any`; check the [`grammar.css.pegjs`](/examples/grammar.css.pegjs) and [`grammar.pegjs.pegjs`](/examples/grammar.pegjs.pegjs) files in this repository for some examples.

### Backtick strings

Given that the grammar is already incompatible with PegJS, I decided to implement backtick strings, just like in JavaScript. Unlike JavaScript, interpolating values isn't currently allowed.

```pegjs
keyword = "if" / "then" / "else" / "endif"
keyword = 'if' / 'then' / 'else' / 'endif'
keyword = `if` / `then` / `else` / `endif`
```

### Leading `/` in alternatives

Alternatives are now allowed to be prefixed with a `/`:

```pegjs
keyword =
  / break
  / case
  / catch
  / continue
```

### Transactional parsing

> **Warning**
> 
> This feature isn't compatible with the `cache: true` option.

Parsers have access to a new `onRollback` function. This function will be called if Arpege detects that the alternative it follows won't work, and can be used to clean state previously set by your actions. For example:

```pegjs
identifier = name:$[a-z]+ {
  identifiers.push(name);
  onRollback(() => {
    identifiers.pop();
  });
}
```

## Why forking PegJS?

I wanted to use PegJS on a small language idea I have. However, it proved very difficult to integrate it within VSCode with proper syntactic coloration. I started working on implementing a tokenizer in my own fork, but before that I decided to move the codebase to TypeScript to make this work easier and safer.

Once the tokenizer was done I decided to implement some of the features I felt I was missing, and in the end I got a project that was almost but not entirely backward-compatible with PegJS. Given that I'm already leading the development for [Yarn](https://yarnpkg.com), I unfortunately don't have the bandwidth required to efficiently contribute to an additional community (with the many back-and-forth that usually comes with it), so I decided to fork the project to simplify the contribution process.

## License (MIT)

> **Copyright © 2022 Mael Nison**
>
> **Copyright © 2010-2016 David Majda**
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
