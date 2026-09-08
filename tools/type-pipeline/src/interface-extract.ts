import ts from 'typescript';

export interface InterfaceField {
  name: string;
  type: string;
  optional: boolean;
}

export interface ExtractedInterface {
  name: string;
  fields: InterfaceField[];
}

function nodeText(type: ts.TypeNode): string {
  if (ts.isLiteralTypeNode(type)) {
    const lit = type.literal;
    if (ts.isStringLiteral(lit)) return JSON.stringify(lit.text);
    return lit.getText();
  }
  if (ts.isArrayTypeNode(type)) return `${nodeText(type.elementType)}[]`;
  return type.getText(ts.createSourceFile('x.ts', '', ts.ScriptTarget.ES2022));
}

/**
 * Extract exported interfaces from a server type-definition file via the TS AST.
 * Only property signatures with resolvable primitive/literal/array/nested-interface
 * shapes are supported; anything else surfaces as `unknown` (uncertainty rule:
 * never guess). The server file is read, never modified.
 */
export function extractInterfaces(filePath: string): ExtractedInterface[] {
  const source = ts.createSourceFile(filePath, ts.sys.readFile(filePath) ?? '', ts.ScriptTarget.ES2022, true);
  const interfaces = new Map<string, ts.InterfaceDeclaration>();
  for (const stmt of source.statements) {
    if (ts.isInterfaceDeclaration(stmt)) interfaces.set(stmt.name.text, stmt);
  }

  const renderType = (type: ts.TypeNode, seen: Set<string>): string => {
    if (ts.isTypeReferenceNode(type)) {
      const refName = type.typeName.getText(source);
      const target = interfaces.get(refName);
      if (target && !seen.has(refName)) return inline(target, new Set([...seen, refName]));
      return 'unknown';
    }
    if (ts.isArrayTypeNode(type)) return `${renderType(type.elementType, seen)}[]`;
    if (ts.isLiteralTypeNode(type)) return nodeText(type);
    if (ts.isUnionTypeNode(type)) return type.types.map((t) => renderType(t, seen)).join(' | ');
    const text = type.getText(source);
    if (['string', 'number', 'boolean'].includes(text)) return text;
    return 'unknown';
  };

  const inline = (decl: ts.InterfaceDeclaration, seen: Set<string>): string => {
    const parts: string[] = [];
    for (const member of decl.members) {
      if (!ts.isPropertySignature(member) || !member.type || !ts.isIdentifier(member.name)) continue;
      parts.push(`${member.name.text}${member.questionToken ? '?' : ''}: ${renderType(member.type, seen)}`);
    }
    return parts.length > 0 ? `{ ${parts.join('; ')} }` : 'Record<string, unknown>';
  };

  return [...interfaces.values()].map((decl) => ({
    name: decl.name.text,
    fields: decl.members.flatMap((member) => {
      if (!ts.isPropertySignature(member) || !member.type || !ts.isIdentifier(member.name)) return [];
      return [{ name: member.name.text, type: renderType(member.type, new Set(decl.name.text)), optional: !!member.questionToken }];
    }),
  }));
}
