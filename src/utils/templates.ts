import { Child, div, li, span, ul } from "./elements";

export function panelGroup(
  name: string,
  rows: [attr: string, value: Child | Child[], highlight?: boolean][]
) {
  return div({}, [
    span({ class: "__tailor-panel__group-name" }, [`${name}`]),
    ul(
      {},
      rows.map(([attr, value, highlight]) =>
        li({ class: "__tailor-panel__row" }, [
          span({ class: "__tailor-panel__row-label" }, `${attr}:`),
          span(
            {
              class: `__tailor-panel__row-value ${
                highlight && "__tailor-panel__row-value--highlight"
              }`,
            },
            value
          ),
        ])
      )
    ),
  ]);
}
