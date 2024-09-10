import pegjsGrammar     from 'arpege/examples/grammar.pegjs.pegjs';
import {asts, generate} from 'arpege';
import {execFile}       from 'child_process';
import {posix}          from 'path';
import * as vscode      from 'vscode';

const saferEval = eval;

const BUILTIN_GRAMMARS = {
  pegjs: pegjsGrammar,
};

export async function activate(context: vscode.ExtensionContext) {
  const tokenTypes = [`namespace`, `class`, `enum`, `interface`, `struct`, `typeParameter`, `type`, `parameter`, `variable`, `property`, `enumMember`, `decorator`, `event`, `function`, `method`, `macro`, `label`, `comment`, `string`, `keyword`, `number`, `regexp`, `operator`, `code:js`, `code:ts`, `error`];
  const tokenModifiers = [`declaration`, `definition`, `readonly`, `static`, `deprecated`, `abstract`, `async`, `modification`, `documentation`, `defaultLibrary`];
  const legend = new vscode.SemanticTokensLegend(tokenTypes, tokenModifiers);

  const legendTypeSet = new Set(legend.tokenTypes);
  const parserCache = new Map<string, any | Promise<any>>();

  function getLanguageNameForFile(fileName: string) {
    const fileMatch = fileName.match(/\.([a-z]+)(\.stx)?$/);
    if (!fileMatch) {
      console.log(`Unknown file name`);
      return null;
    }

    return fileMatch[1];
  }

  function execFileP(binName: string, args: Array<string>, {stdin}: {stdin?: string} = {}) {
    return new Promise<{
      stdout: string;
      stderr: string;
    }>((resolve, reject) => {
      const child = execFile(binName, args, {
        cwd: vscode.workspace.workspaceFolders![0].uri.fsPath,
      }, (err, stdout, stderr) => {
        if (err) {
          reject(err);
        } else {
          resolve({stdout, stderr});
        }
      });

      child.stdin!.end(stdin);
    });
  }

  async function runNodeViaYarn(args: Array<string>, {stdin}: {stdin?: string} = {}) {
    const {stdout} = await execFileP(`yarn`, [`node`, ...args], {stdin});
    return stdout;
  }

  async function runNodeDirect(args: Array<string>, {stdin}: {stdin?: string} = {}) {
    const {stdout} = await execFileP(`node`, args, {stdin});
    return stdout;
  }

  const generateFromBuiltinCompiler = async (grammar: string) => {
    return generate(grammar, {output: `parser`, mode: `tokenizer`});
  };

  const generateFromProjectCompiler = async (grammarPath: string, grammar: string) => {
    if (!grammarPath)
      return generateFromBuiltinCompiler(grammar);

    const packageManager = vscode.workspace.getConfiguration(`npm`).get(`packageManager`) as any;
    const runNode = packageManager === `yarn`
      ? runNodeViaYarn
      : runNodeDirect;

    let source: string;
    try {
      source = await runNode([`-p`, `require('module').createRequire('arpege', process.argv[1]).generate(fs.readFileSync(0), {mode: 'tokenizer'})`, grammarPath], {stdin: grammar});
    } catch (err) {
      return generateFromBuiltinCompiler(grammar);
    }

    return saferEval(source);
  };

  async function loadGrammarFromFs(grammarUri: vscode.Uri) {
    const grammarData = await vscode.workspace.fs.readFile(grammarUri);
    const grammar = Buffer.from(grammarData).toString(`utf8`);

    return generateFromProjectCompiler(grammarUri.fsPath, grammar);
  }

  async function loadGrammarFromPackage(grammarModule: string) {
    const packageManager = vscode.workspace.getConfiguration(`npm`).get(`packageManager`) as any;
    const runNode = packageManager === `yarn`
      ? runNodeViaYarn
      : runNodeDirect;

    const grammarPath = (await runNode([`-p`, `require.resolve(process.argv[1])`, grammarModule])).trim();
    const grammar = await runNode([`-e`, `fs.createReadStream(process.argv[1]).pipe(process.stdout)`, grammarPath]);

    return generateFromProjectCompiler(grammarPath, grammar);
  }

  async function getGrammar(languageName: string): Promise<{parserKey: string, loadGrammar: () => Promise<any | null>} | null> {
    const parsers = vscode.workspace.getConfiguration(`supersyntax`).get(`parsers`) as any;

    if (!Object.prototype.hasOwnProperty.call(parsers, languageName)) {
      if (Object.prototype.hasOwnProperty.call(BUILTIN_GRAMMARS, languageName))
        return {parserKey: `builtin@${languageName}`, loadGrammar: async () => generateFromBuiltinCompiler(BUILTIN_GRAMMARS[languageName as keyof typeof BUILTIN_GRAMMARS])};

      console.log(`No parser configured for ${languageName}`);
      return null;
    }

    const parserSource = parsers[languageName];

    // If the grammar is contained within a Node package
    if (parserSource.startsWith(`~`))
      return {parserKey: parserSource, loadGrammar: () => loadGrammarFromPackage(parserSource.slice(1))};

    const folderUri = vscode.workspace.workspaceFolders![0].uri;
    const grammarUri = folderUri.with({path: posix.join(folderUri.path, parsers[languageName])});

    if (!grammarUri.path.match(/\.pegjs(\.stx)?$/))
      throw new Error(`SuperSyntax parsers must have the '.pegjs' or '.pegjs.stx' extensions`);

    const parserKey = grammarUri.toString();
    const loadGrammar = () => loadGrammarFromFs(grammarUri);

    return {parserKey, loadGrammar};
  }

  async function getParser(languageName: string) {
    const languageInfo = await getGrammar(languageName);
    if (!languageInfo)
      return null;

    const {
      parserKey,
      loadGrammar,
    } = languageInfo;

    let parserCacheEntry = parserCache.get(parserKey);
    if (typeof parserCacheEntry === `undefined`) {
      parserCache.set(parserKey, parserCacheEntry = loadGrammar().then(parser => {
        parserCache.set(parserKey, parser);
        return parser;
      }));
    }

    return await parserCacheEntry;
  }

  const watcher = vscode.workspace.createFileSystemWatcher(`**/*.pegjs`);

  watcher.onDidChange(uri => {
    parserCache.delete(uri.toString());
  });

  function getRangeFromToken(relativeTo: vscode.Position, startLine: number, startColumn: number, endLine: number, endColumn: number) {
    const start = new vscode.Position(startLine - 1 + relativeTo.line, startColumn - 1 + (startLine === 1 ? relativeTo.character : 0));
    const end = new vscode.Position(endLine - 1 + relativeTo.line, endColumn - 1 + (endLine === 1 ? relativeTo.character : 0));

    return new vscode.Range(start, end);
  }

  function getFullDocumentRange(document: vscode.TextDocument) {
    const invalidRange = new vscode.Range(0, 0, document.lineCount, 0);
    const fullRange = document.validateRange(invalidRange);

    return fullRange;
  }

  function convertErrorToDiagnostic(document: vscode.TextDocument, error: any) {
    const range = error.location
      ? getRangeFromToken(new vscode.Position(0, 0), error.location.start.line, error.location.start.column, error.location.end.line, error.location.end.column)
      : getFullDocumentRange(document);

    return new vscode.Diagnostic(range, error.message, vscode.DiagnosticSeverity.Error);
  }

  function importToken(token: asts.Token, document: vscode.TextDocument, relativeTo: vscode.Position, tokensBuilder: vscode.SemanticTokensBuilder) {
    if (!token.type)
      return null;

    const tokenLanguageMatch = token.type.match(/^language:(.*)$/);
    if (tokenLanguageMatch) {
      const range = getRangeFromToken(relativeTo, token.location.start.line, token.location.start.column, token.location.end.line, token.location.end.column);
      return importExternalLanguageToken(tokenLanguageMatch[1], document, range, tokensBuilder);
    }

    let tokenType = token.type;
    if (tokenType === `syntax`) {
      if (token.raw.match(/^[^a-z]+$/)) {
        tokenType = `operator`;
      } else {
        tokenType = `keyword`;
      }
    }

    if (!legendTypeSet.has(tokenType))
      tokenType = `error`;

    const startLine = token.location.start.line;
    const endLine = token.location.end.line;

    const getLineWidth = (line: number) => document.lineAt(relativeTo.line + line).range.end.character;

    for (let t = startLine; t <= endLine; ++t) {
      const lineWidth = getLineWidth(t - 1) + 1;

      const startColumn = t === startLine ? token.location.start.column : 1;
      const endColumn = t === endLine ? Math.min(token.location.end.column, lineWidth + 1) : lineWidth;
      if (startColumn === endColumn)
        continue;

      const range = getRangeFromToken(relativeTo, t, startColumn, t, endColumn);
      tokensBuilder.push(range, tokenType, token.modifiers);
    }

    return null;
  }

  async function importExternalLanguageToken(languageName: string, document: vscode.TextDocument, range: vscode.Range, tokensBuilder: vscode.SemanticTokensBuilder) {
    const parser = await getParser(languageName);
    if (!parser)
      return;

    const tokens = parser.parse(document.getText(range));
    const tokenPromises: Array<Promise<void>> = [];

    for (const token of tokens) {
      if (!token)
        continue;

      const promise = importToken(token, document, range.start, tokensBuilder);
      if (promise) {
        tokenPromises.push(promise);
      }
    }

    await Promise.all(tokenPromises);
  }

  const provider: vscode.DocumentSemanticTokensProvider = {
    async provideDocumentSemanticTokens(document) {
      const languageName = getLanguageNameForFile(document.fileName);
      if (!languageName)
        return null;

      const tokensBuilder = new vscode.SemanticTokensBuilder(legend);

      const invalidRange = new vscode.Range(0, 0, document.lineCount, 0);
      const fullRange = document.validateRange(invalidRange);

      try {
        await importExternalLanguageToken(languageName, document, fullRange, tokensBuilder);
      } catch (err: any) {
        diagnosticCollection.set(document.uri, [convertErrorToDiagnostic(document, err)]);
        throw err;
      }

      diagnosticCollection.set(document.uri, []);

      return tokensBuilder.build();
    },
  };

  const selector = {
    language: `supersyntax`,
    scheme: `file`,
  };

  const diagnosticCollection = vscode.languages.createDiagnosticCollection(`supersyntax`);

  context.subscriptions.push(
    vscode.languages.registerDocumentSemanticTokensProvider(selector, provider, legend),
  );

  context.subscriptions.push(
    diagnosticCollection,
  );
}
