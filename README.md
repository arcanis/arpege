# <img src="./logo.svg" height="25" /> Arpege

> Language parser generator - fork of PegJS

[![npm version](https://img.shields.io/npm/v/arpege.svg)](https://yarnpkg.com/package/arpege) [![Licence](https://img.shields.io/npm/l/arpege.svg)](https://github.com/arcanis/arpege#license-mit) [![Yarn](https://img.shields.io/badge/developed%20with-Yarn%202-blue)](https://github.com/yarnpkg/berry)

## Installation

```sh
yarn add arpege
```

## Usage

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
