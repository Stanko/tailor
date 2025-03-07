export type Child = string | HTMLElement | SVGElement;

type Element<T> = (attributes?: Record<string, string>, children?: Child | Child[]) => T;

export function el(
  tagName: string,
  attributes: Record<string, string> = {},
  children: Child | Child[] = []
): HTMLElement {
  // Create element
  const $div = document.createElement(tagName);

  // If children is a single element, wrap it into array
  if (!Array.isArray(children)) {
    children = [children];
  }

  // Loop through and append children
  children.forEach((child) => {
    if (typeof child === "string") {
      $div.append(child);
    } else {
      $div.appendChild(child);
    }
  });

  // Sett HTML attributes
  for (const name in attributes) {
    $div.setAttribute(name, attributes[name]);
  }

  return $div;
}

const elementFactory =
  <T>(tag: string): Element<T> =>
  (attributes = {}, children = []) =>
    el(tag, attributes, children) as T;

export const div = elementFactory<HTMLDivElement>("div");
export const span = elementFactory<HTMLSpanElement>("span");
export const li = elementFactory<HTMLLIElement>("li");
export const ul = elementFactory<HTMLUListElement>("ul");
