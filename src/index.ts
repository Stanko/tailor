type Vector = { x: number; y: number };

type Child = string | HTMLElement | SVGElement;

function el(
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

const div = (attributes: Record<string, string> = {}, children: Child | Child[] = []) => {
  return el("div", attributes, children) as HTMLDivElement;
};

const span = (attributes: Record<string, string> = {}, children: Child | Child[] = []) => {
  return el("span", attributes, children) as HTMLSpanElement;
};

type ToggleKey = "Control" | "Meta" | "Alt";

function getRect($el: HTMLElement | SVGElement) {
  const rect = $el.getBoundingClientRect();
  rect.x += window.scrollX;
  rect.y += window.scrollY;
  return rect;
}

function getBox($el: HTMLElement | SVGElement) {
  if ($el instanceof SVGElement) {
    return getRect($el);
  }

  let y = 0;
  let x = 0;
  let $element: HTMLElement | null = $el;
  const width = $el.offsetWidth;
  const height = $el.offsetHeight;

  do {
    y += $element.offsetTop || 0;
    x += $element.offsetLeft || 0;
    // TODO check if this is safe to cast
    $element = $element.offsetParent as HTMLElement;
  } while ($element);

  return {
    x,
    y,
    width,
    height,
  };
}

function toFixed(n: number, decimals: number = 1) {
  return +n.toFixed(decimals);
}

function setPosition($el: HTMLElement, left: number, top: number, width: number, height: number) {
  $el.style.left = `${left}px`;
  $el.style.top = `${top}px`;
  $el.style.width = `${width}px`;
  $el.style.height = `${height}px`;
}

function setHorizontalRuler(
  $el: HTMLDivElement,
  xStart: number,
  yStart: number,
  xEnd: number,
  fixValue: number = 0
) {
  if (xStart > xEnd) {
    const tmp = xEnd;
    xEnd = xStart;
    xStart = tmp;
  }
  const width = toFixed(xEnd - xStart);

  // Only rulers have a div child, helpers don't
  // Make sure to update the value for rulers only
  if ($el.firstChild) {
    $el.firstChild.textContent = width > 0 ? width.toString() : "";
  }

  setPosition($el, xStart, yStart - fixValue, width, 0);
}

function setVerticalRuler(
  $el: HTMLDivElement,
  xStart: number,
  yStart: number,
  yEnd: number,
  fixValue: number = 0
) {
  if (yStart > yEnd) {
    const tmp = yEnd;
    yEnd = yStart;
    yStart = tmp;
  }

  const height = toFixed(yEnd - yStart);

  // Only rulers have a div child, helpers don't
  // Make sure to update the value for rulers only
  if ($el.firstChild) {
    $el.firstChild.textContent = height > 0 ? height.toString() : "";
  }

  setPosition($el, xStart - fixValue, yStart, 0, height);
}

class Tailor {
  toggleKey: ToggleKey;

  $elementsToReset: HTMLDivElement[];
  $rulers: HTMLDivElement[];
  $helpers: HTMLDivElement[];

  $tailor: HTMLDivElement;
  $mask: HTMLDivElement;
  $highlight: HTMLDivElement;
  $padding: HTMLDivElement;
  $margin: HTMLDivElement;
  $toMask: HTMLDivElement;

  $xRuler: HTMLDivElement;
  $xRuler2: HTMLDivElement;

  $yRuler: HTMLDivElement;
  $yRuler2: HTMLDivElement;

  $xRulerHelper: HTMLDivElement;
  $xRulerHelper2: HTMLDivElement;

  $yRulerHelper: HTMLDivElement;
  $yRulerHelper2: HTMLDivElement;

  $panel: HTMLDivElement;

  $current: HTMLElement | null = null;
  $measureTo: HTMLElement | null = null;

  selected: boolean = false;

  constructor(toggleKey: ToggleKey = "Alt") {
    this.toggleKey = toggleKey;

    // Create elements
    this.$mask = div({ class: "__tailor-mask" });
    this.$toMask = div({ class: "__tailor-to-mask" });

    this.$margin = div({ class: "__tailor-margin" });
    this.$padding = div({ class: "__tailor-padding" });
    this.$highlight = div({ class: "__tailor-highlight" }, [this.$margin, this.$padding]);

    this.$xRuler = div({ class: "__tailor-ruler __tailor-ruler--x" }, div());
    this.$xRuler2 = div({ class: "__tailor-ruler __tailor-ruler--x" }, div());

    this.$yRuler = div({ class: "__tailor-ruler __tailor-ruler--y" }, div());
    this.$yRuler2 = div({ class: "__tailor-ruler __tailor-ruler--y" }, div());

    this.$xRulerHelper = div({ class: "__tailor-ruler-helper __tailor-ruler-helper--x" });
    this.$xRulerHelper2 = div({ class: "__tailor-ruler-helper __tailor-ruler-helper--x" });

    this.$yRulerHelper = div({ class: "__tailor-ruler-helper __tailor-ruler-helper--y" });
    this.$yRulerHelper2 = div({ class: "__tailor-ruler-helper __tailor-ruler-helper--y" });

    this.$panel = div({ class: "__tailor-panel" });

    // Save all rulers so we can disable them all together
    this.$rulers = [this.$xRuler, this.$xRuler2, this.$yRuler, this.$yRuler2];
    this.$helpers = [
      this.$xRulerHelper,
      this.$xRulerHelper2,
      this.$yRulerHelper,
      this.$yRulerHelper2,
    ];

    this.$tailor = div({ class: "__tailor" }, [
      this.$mask,
      this.$highlight,
      this.$toMask,
      ...this.$rulers,
      ...this.$helpers,
      this.$panel,
    ]);

    // Save other elements that need position reset
    this.$elementsToReset = [this.$mask, this.$highlight, this.$margin, this.$toMask];

    // Singleton
    if ((window as any).__tailor_instance) {
      return (window as any).__tailor_instance as Tailor;
    }

    document.body.append(this.$tailor);

    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
    window.addEventListener("blur", this.handleWindowBlur);

    (window as any).__tailor_instance = this;
    console.log(
      "%c T ",
      "background-color: #0b99ff; color: white; line-height: 17px; display: inline-block;",
      "Tailor initialized"
    );
  }

  // ----- External API ----- //

  updateToggleKey(toggleKey: ToggleKey) {
    this.toggleKey = toggleKey;
  }

  // ----- CONTROLS ----- //

  enable() {
    this.$panel.replaceChildren(span({}, ["Tailor"]), " ready");
    this.$tailor.style.display = "block";

    // To prevent guidelines overflowing and creating scrollbars
    this.$tailor.style.width = document.body.scrollWidth + "px";
    this.$tailor.style.height = document.body.scrollHeight + "px";

    // Click and mousedown are using "capture = true" to prevent clicks on interactive elements
    // That way we can still measure without clicking and navigating from the page
    window.addEventListener("mousedown", this.handleMouseDown, true);
    window.addEventListener("click", this.handleClick, true);
    window.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("contextmenu", this.handleContextMenu);
  }

  disable() {
    window.removeEventListener("mousedown", this.handleMouseDown, true);
    window.removeEventListener("click", this.handleClick, true);
    window.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("contextmenu", this.handleContextMenu);

    this.$elementsToReset.forEach(($element) => {
      $element.setAttribute("style", "");
    });
    this.$margin.textContent = "";
    this.$padding.textContent = "";
    this.resetRulers();

    this.$tailor.style.display = "none";
    this.$current = null;
    this.selected = false;
    this.$tailor.classList.remove("__tailor--measuring");
    this.$measureTo = null;
  }

  resetRulers() {
    this.$rulers.forEach(($ruler) => {
      $ruler.setAttribute("style", "");
      // All rulers have a div child
      ($ruler.firstChild as HTMLDivElement).textContent = "";
    });
    this.$helpers.forEach(($helper) => {
      $helper.setAttribute("style", "");
    });
  }

  destroy() {
    this.disable();
    this.$tailor.remove();
    delete (window as any).__tailor_instance;
    window.removeEventListener("keyup", this.handleKeyUp);
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("blur", this.handleWindowBlur);
  }

  // ----- EVENT HANDLERS ----- //

  handleContextMenu = (e: Event) => {
    e.preventDefault();
  };

  handleKeyDown = (e: KeyboardEvent) => {
    if (e.repeat) {
      return;
    }
    if (e.key === this.toggleKey) {
      this.enable();
    }
  };

  handleKeyUp = (e: KeyboardEvent) => {
    if (e.key === this.toggleKey) {
      this.disable();
    }
  };

  handleWindowBlur = () => {
    this.disable();
  };

  handleMouseMove = (e: MouseEvent) => {
    // TODO verify using EventTarget instead of casting to HTMLElement
    const $target = e.target as HTMLElement;
    if (this.selected) {
      if (this.$measureTo !== $target && this.$current && this.$current !== $target) {
        this.measureDistance(this.$current, $target);
        this.updatePanel($target);
      }
    } else if (this.$current !== e.target) {
      this.$current = $target;

      this.highlightElement(this.$current);
      this.updatePanel(this.$current);
    }
  };

  handleClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  handleMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    this.selected = true;
    this.$tailor.classList.add("__tailor--measuring");
    this.$current = e.target as HTMLElement;
    this.highlightElement(this.$current);
    // reset to-mask when selecting a new element
    this.$toMask.setAttribute("style", "");
  };

  // ----- MAIN ----- //

  highlightElement($el: HTMLElement) {
    this.resetRulers();

    const style = getComputedStyle($el);

    const outerBox = getRect($el);
    const box = this.selected ? outerBox : getBox($el);

    const { $mask, $highlight, $margin, $padding } = this;

    const margin = {
      top: parseFloat(style.marginTop),
      bottom: parseFloat(style.marginBottom),
      left: parseFloat(style.marginLeft),
      right: parseFloat(style.marginRight),
      inline: parseFloat(style.marginLeft) + parseFloat(style.marginRight),
      block: parseFloat(style.marginTop) + parseFloat(style.marginBottom),
    };
    const padding = {
      top: parseFloat(style.paddingTop),
      bottom: parseFloat(style.paddingBottom),
      left: parseFloat(style.paddingLeft),
      right: parseFloat(style.paddingRight),
      inline: parseFloat(style.paddingLeft) + parseFloat(style.paddingRight),
      block: parseFloat(style.paddingTop) + parseFloat(style.paddingBottom),
    };

    setPosition($highlight, box.x, box.y, box.width, box.height);

    setPosition($mask, outerBox.x, outerBox.y, outerBox.width, outerBox.height);

    $highlight.style.paddingLeft = style.paddingLeft;
    $highlight.style.paddingRight = style.paddingRight;
    $highlight.style.paddingTop = style.paddingTop;
    $highlight.style.paddingBottom = style.paddingBottom;

    $highlight.style.transform = this.selected ? "" : style.transform;

    setPosition(
      $margin,
      -margin.left,
      -margin.top,
      box.width + margin.inline,
      box.height + margin.block
    );

    const marginElements: HTMLDivElement[] = [];
    const paddingElements: HTMLDivElement[] = [];
    const sides = ["top", "right", "bottom", "left"] as const;

    sides.forEach((side) => {
      if (margin[side]) {
        marginElements.push(
          div({ class: `__tailor-margin-label __tailor-margin-label--${side}` }, [
            toFixed(margin[side]).toString(),
          ])
        );
      }
      if (padding[side]) {
        paddingElements.push(
          div({ class: `__tailor-padding-label __tailor-padding-label--${side}` }, [
            toFixed(padding[side]).toString(),
          ])
        );
      }
    });

    $margin.replaceChildren(...marginElements);
    $padding.replaceChildren(...paddingElements);
  }

  measureDistance($current: HTMLElement, $measureTo: HTMLElement) {
    const from = getRect($current);
    const to = getRect($measureTo);

    const {
      $xRuler,
      $xRuler2,
      $yRuler,
      $yRuler2,
      $xRulerHelper,
      $xRulerHelper2,
      $yRulerHelper,
      $yRulerHelper2,
    } = this;

    if ($measureTo) {
      setPosition(this.$toMask, to.left, to.top, to.width, to.height);
    }

    const positions: Record<
      | "horizontal1"
      | "horizontal2"
      | "vertical1"
      | "vertical2"
      | "hHelper1"
      | "hHelper2"
      | "vHelper1"
      | "vHelper2",
      [number, number, number, number]
    > = {
      horizontal1: [0, 0, 0, 0],
      horizontal2: [0, 0, 0, 0],
      vertical1: [0, 0, 0, 0],
      vertical2: [0, 0, 0, 0],
      hHelper1: [0, 0, 0, 0],
      hHelper2: [0, 0, 0, 0],
      vHelper1: [0, 0, 0, 0],
      vHelper2: [0, 0, 0, 0],
    };

    this.$measureTo = $measureTo;

    const isAbove = from.bottom <= to.top;
    const isBelow = from.top >= to.bottom;

    const intersectsVertically = !isAbove && !isBelow;

    const isLeft = from.right <= to.left;
    const isRight = from.left >= to.right;

    const intersectsHorizontally = !isLeft && !isRight;

    const midFrom: Vector = {
      x: from.left + from.width * 0.5,
      y: from.top + from.height * 0.5,
    };

    if (intersectsHorizontally) {
      const x1 = Math.max(from.left, to.left);
      const x2 = Math.min(from.right, to.right);

      midFrom.x = x1 + (x2 - x1) / 2;
    }

    if (intersectsVertically) {
      const y1 = Math.max(from.top, to.top);
      const y2 = Math.min(from.bottom, to.bottom);

      midFrom.y = y1 + (y2 - y1) / 2;
    }

    if (isAbove) {
      // fb - tt
      // isAbove
      positions.vertical1 = [midFrom.x, from.bottom, to.top, 0];
    } else if (isBelow) {
      // ft - tb
      // isBelow
      positions.vertical1 = [midFrom.x, from.top, to.bottom, 1];
    } else {
      // fb - tb
      // ft - tt
      // intersectsVertically
      positions.vertical1 = [midFrom.x, from.bottom, to.bottom, 1];
      positions.vertical2 = [midFrom.x, from.top, to.top, 0];
    }

    if (isLeft) {
      // fr - tl
      // isLeft
      positions.horizontal1 = [from.right, midFrom.y, to.left, 0];
    } else if (isRight) {
      // fl - tr
      // isRight
      positions.horizontal1 = [from.left, midFrom.y, to.right, 1];
    } else {
      // fr - tr
      // fl - tl
      // intersectsHorizontally
      positions.horizontal1 = [from.right, midFrom.y, to.right, 1];
      positions.horizontal2 = [from.left, midFrom.y, to.left, 0];
    }

    if (isLeft || isRight) {
      positions.hHelper1 = [midFrom.x, positions.vertical1[2], to.left, positions.vertical1[3]]; // yuradi isto
      if (intersectsVertically) {
        positions.hHelper2 = [midFrom.x, positions.vertical2[2], to.left, 0];
      }
    }

    if (isAbove || isBelow) {
      positions.vHelper1 = [positions.horizontal1[2], midFrom.y, to.top, positions.horizontal1[3]];
      if (intersectsHorizontally) {
        positions.vHelper2 = [positions.horizontal2[2], midFrom.y, to.top, 0];
      }
    }

    // Rulers
    setVerticalRuler($yRuler, ...positions.vertical1);
    setVerticalRuler($yRuler2, ...positions.vertical2);
    setHorizontalRuler($xRuler, ...positions.horizontal1);
    setHorizontalRuler($xRuler2, ...positions.horizontal2);

    // Helpers
    setHorizontalRuler($xRulerHelper, ...positions.hHelper1);
    setHorizontalRuler($xRulerHelper2, ...positions.hHelper2);
    setVerticalRuler($yRulerHelper, ...positions.vHelper1);
    setVerticalRuler($yRulerHelper2, ...positions.vHelper2);
  }

  updatePanel($el: HTMLElement | SVGElement) {
    const style = getComputedStyle($el);
    const id = $el.id ? `#${$el.id}` : "";

    let className = $el.getAttribute("class");

    if (className) {
      className = `.${$el.getAttribute("class")?.split(" ").join(".")}`;
    } else {
      className = "";
    }

    let font = style.fontFamily;
    const fontStack = style.fontFamily.split(", ");

    for (const i in fontStack) {
      if (document.fonts.check(`16px ${fontStack[i]}`)) {
        font = fontStack[i].replace(/"/g, "");
        break;
      }
    }

    let height = style.height.replace("px", "");
    let width = style.width.replace("px", "");

    if (height === "auto" || width === "auto") {
      // For SVG elements use getBoundingClientRect
      if ($el instanceof SVGElement) {
        const rect = getRect($el);
        height = rect.height.toString();
        width = rect.width.toString();
      } else {
        height = $el.offsetHeight.toString();
        width = $el.offsetWidth.toString();
      }
    }

    this.$panel.replaceChildren(
      // Element tag and id/class
      span({}, [$el.tagName.toLowerCase()]),
      `${id}${className}`,
      // Dimensions
      div({}, [`${width}x${height}px`]),
      // Font
      div({}, [font]),
      div({}, [`${style.fontSize} ${style.lineHeight}`]),
      div({}, [`${style.fontWeight} ${style.fontStyle}`])
    );
  }
}

export default Tailor;
