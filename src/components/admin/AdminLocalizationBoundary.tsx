"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translateAdminText } from "@/lib/i18n";

const translatedValues = new WeakMap<Node, string>();
const sourceValues = new WeakMap<Node, string>();
const translatedAttributes = new WeakMap<Element, Map<string, string>>();
const sourceAttributes = new WeakMap<Element, Map<string, string>>();
const attributes = ["aria-label", "placeholder", "title"] as const;

function translatePreservingWhitespace(value: string, language: "en" | "fr") {
  const match = value.match(/^(\s*)([\s\S]*?)(\s*)$/);
  if (!match || !match[2]) return value;
  const [, before, content, after] = match;
  return `${before}${translateAdminText(language, content)}${after}`;
}

function isExcluded(node: Node) {
  const element = node instanceof Element ? node : node.parentElement;
  return Boolean(element?.closest("[data-admin-no-translate], script, style"));
}

function localizeTextNode(node: Text, language: "en" | "fr") {
  if (isExcluded(node)) return;
  const current = node.data;
  if (current !== translatedValues.get(node)) sourceValues.set(node, current);
  const source = sourceValues.get(node) ?? current;
  const next = language === "fr" ? translatePreservingWhitespace(source, language) : source;
  translatedValues.set(node, next);
  if (current !== next) node.data = next;
}

function localizeAttribute(element: Element, attribute: string, language: "en" | "fr") {
  if (isExcluded(element)) return;
  const current = element.getAttribute(attribute);
  if (current === null) return;
  const lastValues = translatedAttributes.get(element) ?? new Map<string, string>();
  const originals = sourceAttributes.get(element) ?? new Map<string, string>();
  if (current !== lastValues.get(attribute)) originals.set(attribute, current);
  const source = originals.get(attribute) ?? current;
  const next = language === "fr" ? translateAdminText(language, source) : source;
  lastValues.set(attribute, next);
  translatedAttributes.set(element, lastValues);
  sourceAttributes.set(element, originals);
  if (current !== next) element.setAttribute(attribute, next);
}

function localizeTree(root: Node, language: "en" | "fr") {
  if (root instanceof Text) {
    localizeTextNode(root, language);
    return;
  }
  if (root instanceof Element) {
    for (const attribute of attributes) localizeAttribute(root, attribute, language);
    if (root instanceof HTMLInputElement && ["button", "reset", "submit"].includes(root.type)) {
      localizeAttribute(root, "value", language);
    }
  }
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node instanceof Text) localizeTextNode(node, language);
    else if (node instanceof Element) {
      for (const attribute of attributes) localizeAttribute(node, attribute, language);
      if (node instanceof HTMLInputElement && ["button", "reset", "submit"].includes(node.type)) {
        localizeAttribute(node, "value", language);
      }
    }
  }
}

export function AdminLocalizationBoundary({ children }: { children: ReactNode }) {
  const { language } = useLanguage();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    localizeTree(root, language);
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData") localizeTree(mutation.target, language);
        if (mutation.type === "attributes" && mutation.target instanceof Element && mutation.attributeName) {
          localizeAttribute(mutation.target, mutation.attributeName, language);
        }
        for (const node of mutation.addedNodes) localizeTree(node, language);
      }
    });
    observer.observe(root, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...attributes, "value"],
    });
    return () => observer.disconnect();
  }, [language]);

  return <div ref={rootRef} className="contents">{children}</div>;
}
