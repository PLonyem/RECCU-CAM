"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translateUiText } from "@/lib/i18n";

const translatedValues = new WeakMap<Node, string>();
const sourceValues = new WeakMap<Node, string>();
const translatedAttributes = new WeakMap<Element, Map<string, string>>();
const sourceAttributes = new WeakMap<Element, Map<string, string>>();
const attributes = ["alt", "aria-label", "placeholder", "title"] as const;

function translatePreservingWhitespace(value: string, language: "en" | "fr") {
  const match = value.match(/^(\s*)([\s\S]*?)(\s*)$/);
  if (!match || !match[2]) return value;
  const [, before, content, after] = match;
  return `${before}${translateUiText(language, content)}${after}`;
}

function isExcluded(node: Node) {
  const element = node instanceof Element ? node : node.parentElement;
  return Boolean(element?.closest("[data-no-translate], [data-admin-no-translate], code, pre, script, style"));
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
  const next = language === "fr" ? translateUiText(language, source) : source;
  lastValues.set(attribute, next);
  translatedAttributes.set(element, lastValues);
  sourceAttributes.set(element, originals);
  if (current !== next) element.setAttribute(attribute, next);
}

function localizeElement(element: Element, language: "en" | "fr") {
  for (const attribute of attributes) localizeAttribute(element, attribute, language);
  if (element instanceof HTMLInputElement && ["button", "reset", "submit"].includes(element.type)) {
    localizeAttribute(element, "value", language);
  }
}

function isTranslatableAttribute(element: Element, attribute: string) {
  return attributes.includes(attribute as (typeof attributes)[number])
    || (attribute === "value" && element instanceof HTMLInputElement && ["button", "reset", "submit"].includes(element.type));
}

function isPortalledUi(node: Node) {
  const element = node instanceof Element ? node : node.parentElement;
  return Boolean(element?.closest("[data-radix-portal], [role='alertdialog'], [role='dialog'], [role='menu'], [role='listbox']"));
}

function localizeTree(root: Node, language: "en" | "fr") {
  if (root instanceof Text) {
    localizeTextNode(root, language);
    return;
  }
  if (root instanceof Element) localizeElement(root, language);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node instanceof Text) localizeTextNode(node, language);
    else if (node instanceof Element) localizeElement(node, language);
  }
}

export function LocalizationBoundary({ children }: { children: ReactNode }) {
  const { language } = useLanguage();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    localizeTree(root, language);
    document.querySelectorAll("[data-radix-portal], [role='alertdialog'], [role='dialog'], [role='menu'], [role='listbox']")
      .forEach((portal) => localizeTree(portal, language));
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData" && (root.contains(mutation.target) || isPortalledUi(mutation.target))) localizeTree(mutation.target, language);
        if (mutation.type === "attributes" && mutation.target instanceof Element && mutation.attributeName && (root.contains(mutation.target) || isPortalledUi(mutation.target)) && isTranslatableAttribute(mutation.target, mutation.attributeName)) {
          localizeAttribute(mutation.target, mutation.attributeName, language);
        }
        for (const node of mutation.addedNodes) {
          if (root.contains(node) || isPortalledUi(node)) localizeTree(node, language);
          if (node instanceof Element) node.querySelectorAll("[data-radix-portal], [role='alertdialog'], [role='dialog'], [role='menu'], [role='listbox']")
            .forEach((portal) => localizeTree(portal, language));
        }
      }
    });
    observer.observe(document.body, {
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
