import {posix}     from 'path';
import {asts}      from 'pegjs';
import * as vscode from 'vscode';

export async function activate(context: vscode.ExtensionContext) {
  const {generate} = await import(`pegjs`);

  const tokenTypes = [`namespace`, `class`, `enum`, `interface`, `struct`, `typeParameter`, `type`, `parameter`, `variable`, `property`, `enumMember`, `decorator`, `event`, `function`, `method`, `macro`, `label`, `comment`, `string`, `keyword`, `number`, `regexp`, `operator`, `code:js`, `error`];
  const tokenModifiers = [`declaration`, `definition`, `readonly`, `static`, `deprecated`, `abstract`, `async`, `modification`, `documentation`, `defaultLibrary`];
  const legend = new vscode.SemanticTokensLegend(tokenTypes, tokenModifiers);

  const legendTypeSet = new Set(legend.tokenTypes);
  const parserCache = new Map<string, any>();

  function getLanguageNameForFile(fileName: string) {
    const fileMatch = fileName.match(/\.([a-z]+)(\.stx)?$/);
    if (!fileMatch) {
      console.log(`Unknown file name`);
      return null;
    }

    return fileMatch[1];
  }

  async function getParser(languageName: string) {
    const parsers = vscode.workspace.getConfiguration(`supersyntax`).get(`parsers`) as any;

    if (!Object.prototype.hasOwnProperty.call(parsers, languageName)) {
      console.log(`No parser configured for ${languageName}`);
      return null;
    }

    const folderUri = vscode.workspace.workspaceFolders![0].uri;
    const parserUri = folderUri.with({path: posix.join(folderUri.path, parsers[languageName])});
    const parserKey = parserUri.toString();

    let parser = parserCache.get(parserKey);
    if (typeof parser === `undefined`) {
      if (!parserUri.path.match(/\.pegjs(\.stx)?$/))
        throw new Error(`SuperSyntax parsers must have the '.pegjs' or '.pegjs.stx' extensions`);

      const contentData = await vscode.workspace.fs.readFile(parserUri);
      const contentStr = Buffer.from(contentData).toString(`utf8`);

      parser = generate(contentStr, {output: `parser`, tokenizer: true});
      parserCache.set(parserKey, parser);
    }

    return parser;
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

  function importToken(token: asts.Token, document: vscode.TextDocument, relativeTo: vscode.Position, tokensBuilder: vscode.SemanticTokensBuilder) {
    if (!token.type)
      return null;

    console.log(token.type);
    const tokenLanguageMatch = token.type.match(/^language:(.*)$/);
    if (tokenLanguageMatch) {
      console.log(`detecting imported token`, tokenLanguageMatch);
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

    const getLineWidth = (line: number) => document.lineAt(line).range.end.character;

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

      await importExternalLanguageToken(languageName, document, fullRange, tokensBuilder);

      return tokensBuilder.build();
    },
  };

  const selector = {
    language: `supersyntax`,
    scheme: `file`,
  };

  vscode.languages.registerDocumentSemanticTokensProvider(selector, provider, legend);
}
