import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";
import { getDictionaryParity, getInformationPageTranslationGaps, getNavigationTranslationGaps } from "../src/lib/i18n-audit";
import { hasFrenchTranslation, translateUiText } from "../src/lib/i18n";

const roots = ["src/app", "src/components", "src/features"];
const userFacingAttributes = new Set([
  "alt", "aria-label", "caption", "description", "emptyDescription", "emptyTitle",
  "errorMessage", "eyebrow", "helperText", "label", "placeholder", "subtitle",
  "successMessage", "title", "tooltip",
]);
const intentionalStaticExceptions = [
  /^(?:RECCU-CAM(?: LTD)?|VTIME|WhatsApp|Facebook)$/,
  /^(?:[\d.,]+[BMK]?\+|\d+%|[—·|])$/,
  /^(?:[\w.+-]+@|e\.g\.|PDF,|tag1,)/,
  /^(?:en|fr|admin\.|language\.)/,
  /^(?:[A-Za-z]|v|— page|Search: “)$/,
  /^\/ \d+/,
];

function decodeJsx(value: string) {
  return value
    .replaceAll("&apos;", "'")
    .replaceAll("&rsquo;", "’")
    .replaceAll("&ldquo;", "“")
    .replaceAll("&rdquo;", "”")
    .replaceAll("&amp;", "&")
    .replaceAll("&hellip;", "…")
    .replace(/\s+/g, " ")
    .trim();
}

function isCovered(value: string) {
  if (!value || !/[A-Za-z]/.test(value)) return true;
  if (intentionalStaticExceptions.some((pattern) => pattern.test(value))) return true;
  return hasFrenchTranslation(value) || translateUiText("fr", value) !== value;
}

function sourceFiles() {
  const files: string[] = [];
  const walk = (directory: string) => {
    for (const name of readdirSync(directory)) {
      const path = join(directory, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (/\.tsx?$/.test(name)) files.push(path);
    }
  };
  for (const root of roots) {
    try { walk(root); } catch { /* An optional source directory may not exist. */ }
  }
  return files;
}

function obviousHardcodedGaps() {
  const gaps = new Map<string, Set<string>>();
  const add = (raw: string, file: string, node: ts.Node, source: ts.SourceFile) => {
    const value = decodeJsx(raw);
    if (isCovered(value)) return;
    const line = source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
    const locations = gaps.get(value) ?? new Set<string>();
    locations.add(`${file}:${line}`);
    gaps.set(value, locations);
  };

  for (const file of sourceFiles()) {
    const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const visit = (node: ts.Node, inJsx = false) => {
      const inside = inJsx || ts.isJsxElement(node) || ts.isJsxFragment(node) || ts.isJsxSelfClosingElement(node);
      if (inside && ts.isJsxText(node)) add(node.text, file, node, source);
      if (inside && ts.isJsxExpression(node) && !ts.isJsxAttribute(node.parent) && node.expression && ts.isConditionalExpression(node.expression)) {
        for (const branch of [node.expression.whenTrue, node.expression.whenFalse]) {
          if (ts.isStringLiteral(branch) || ts.isNoSubstitutionTemplateLiteral(branch)) add(branch.text, file, branch, source);
        }
      }
      if (ts.isJsxAttribute(node) && userFacingAttributes.has(node.name.getText(source))) {
        const initializer = node.initializer;
        if (initializer && ts.isStringLiteral(initializer)) add(initializer.text, file, initializer, source);
      }
      ts.forEachChild(node, (child) => visit(child, inside));
    };
    visit(source);
  }
  return [...gaps].map(([value, locations]) => ({ value, locations: [...locations] }));
}

const parity = getDictionaryParity();
const navigation = getNavigationTranslationGaps();
const informationPages = getInformationPageTranslationGaps();
const hardcoded = obviousHardcodedGaps();

if (parity.missingInEnglish.length || parity.missingInFrench.length || navigation.length || informationPages.length || hardcoded.length) {
  console.error(JSON.stringify({ parity, navigation, informationPages, hardcoded }, null, 2));
  process.exitCode = 1;
} else {
  console.log("i18n audit passed: dictionary parity, navigation, information pages, and obvious static UI microcopy are covered.");
}
