import {posix}     from 'path';
import * as vscode from 'vscode';

function importToken(token: any) {
  const tokens: Array<vscode.Range> = [];

  const startLine = token.location.start.line;
  const endLine = token.location.end.line;

  for (let t = startLine; t <= endLine; ++t) {
    const start = new vscode.Position(t - 1, t === startLine ? token.location.start.column - 1 : 0);
    const end = new vscode.Position(t - 1, t === endLine ? token.location.end.column - 1 : 1000);

    const range = new vscode.Range(start, end);
    tokens.push(range);
  }

  return tokens;
}

export async function activate(context: vscode.ExtensionContext) {
  const {generate} = await import(`pegjs`);

  const tokenTypes = [`namespace`, `class`, `enum`, `interface`, `struct`, `typeParameter`, `type`, `parameter`, `variable`, `property`, `enumMember`, `decorator`, `event`, `function`, `method`, `macro`, `label`, `comment`, `string`, `keyword`, `number`, `regexp`, `operator`, `code:js`, `error`];
  const tokenModifiers = [`declaration`, `definition`, `readonly`, `static`, `deprecated`, `abstract`, `async`, `modification`, `documentation`, `defaultLibrary`];
  const legend = new vscode.SemanticTokensLegend(tokenTypes, tokenModifiers);

  const legendTypeSet = new Set(legend.tokenTypes);
  const parserCache = new Map<string, any>();

  async function getParser(fileName: string) {
    const fileMatch = fileName.match(/\.([a-z]+)(\.stx)?$/);
    if (!fileMatch) {
      console.log(`Unknown file name`);
      return null;
    }

    const parsers = vscode.workspace.getConfiguration(`supersyntax`).get(`parsers`) as any;
    const parserName = fileMatch[1];

    if (!Object.prototype.hasOwnProperty.call(parsers, parserName)) {
      console.log(`No parser configured for ${parserName}`);
      return null;
    }

    const folderUri = vscode.workspace.workspaceFolders![0].uri;
    const parserUri = folderUri.with({path: posix.join(folderUri.path, parsers[parserName])});
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

  const provider: vscode.DocumentSemanticTokensProvider = {
    async provideDocumentSemanticTokens(document) {
      const parser = await getParser(document.fileName);
      if (!parser)
        return null;

      const tokensBuilder = new vscode.SemanticTokensBuilder(legend);
      const tokens = parser.parse(document.getText()).flat(Infinity);

      for (const token of tokens) {
        if (!token)
          continue;

        if (token.type === `syntax`) {
          if (token.raw.match(/^[^a-z]+$/)) {
            token.type = `operator`;
          } else {
            token.type = `keyword`;
          }
        }

        if (!legendTypeSet.has(token.type))
          token.type = `error`;

        for (const range of importToken(token)) {
          tokensBuilder.push(range, token.type, []);
        }
      }

      return tokensBuilder.build();
    },
  };

  const selector = {
    language: `supersyntax`,
    scheme: `file`,
  };

  vscode.languages.registerDocumentSemanticTokensProvider(selector, provider, legend);
}
