type Vector = { x: number; y: number };

type Child = string | HTMLElement | SVGElement;

function div(attributes: Record<string, any> = {}, children: Child | Child[] = []): HTMLDivElement {
  // Create element
  const $div = document.createElement("div");

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
  for (let name in attributes) {
    $div.setAttribute(name, attributes[name]);
  }

  return $div;
}

const TOGGLE_KEY = "Meta";

function getBox($el: HTMLElement) {
  let top = 0;
  let left = 0;
  let $element: HTMLElement | null = $el;
  const width = $el.offsetWidth;
  const height = $el.offsetHeight;

  do {
    top += $element.offsetTop || 0;
    left += $element.offsetLeft || 0;
    $element = $element.offsetParent;
  } while ($element);

  top += window.scrollY;
  left += window.scrollX;

  return {
    x: left,
    left,
    y: top,
    top,
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
  fixValue: number = 0,
  addNumber: boolean = false
) {
  if (xStart > xEnd) {
    const tmp = xEnd;
    xEnd = xStart;
    xStart = tmp;
  }
  const width = xEnd - xStart;

  $el.innerHTML = addNumber && width > 0 ? `<div>${toFixed(width)}</div>` : "";

  setPosition($el, xStart, yStart - fixValue, width, 0);
}

function setVerticalRuler(
  $el: HTMLDivElement,
  xStart: number,
  yStart: number,
  yEnd: number,
  fixValue: number = 0,
  addNumber: boolean = false
) {
  if (yStart > yEnd) {
    const tmp = yEnd;
    yEnd = yStart;
    yStart = tmp;
  }

  const height = yEnd - yStart;

  $el.innerHTML = addNumber && height > 0 ? `<div>${toFixed(height)}</div>` : "";

  setPosition($el, xStart - fixValue, yStart, 0, height);
}

class Tailor {
  $elementsToReset: HTMLDivElement[];
  $rulers: HTMLDivElement[];

  $tailor: HTMLDivElement;
  $mask: HTMLDivElement;
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

  $highlighted: HTMLElement | null = null;
  $to: HTMLElement | null = null;

  selected: boolean = false;

  constructor() {
    // Create elements
    this.$margin = div({ class: "__tailor-margin" });
    this.$padding = div({ class: "__tailor-padding" });
    this.$mask = div({ class: "__tailor-mask" }, [this.$margin, this.$padding]);
    this.$toMask = div({ class: "__tailor-to-mask" });

    this.$xRuler = div({ class: "__tailor-ruler __tailor-ruler--x" });
    this.$xRuler2 = div({ class: "__tailor-ruler __tailor-ruler--x" });

    this.$yRuler = div({ class: "__tailor-ruler __tailor-ruler--y" });
    this.$yRuler2 = div({ class: "__tailor-ruler __tailor-ruler--y" });

    this.$xRulerHelper = div({ class: "__tailor-ruler-helper __tailor-ruler-helper--x" });
    this.$xRulerHelper2 = div({ class: "__tailor-ruler-helper __tailor-ruler-helper--x" });

    this.$yRulerHelper = div({ class: "__tailor-ruler-helper __tailor-ruler-helper--y" });
    this.$yRulerHelper2 = div({ class: "__tailor-ruler-helper __tailor-ruler-helper--y" });

    this.$panel = div({ class: "__tailor-panel" });

    this.$tailor = div({ class: "__tailor" });

    this.$rulers = [
      this.$xRuler,
      this.$xRuler2,
      this.$yRuler,
      this.$yRuler2,
      this.$xRulerHelper,
      this.$xRulerHelper2,
      this.$yRulerHelper,
      this.$yRulerHelper2,
    ];

    this.$elementsToReset = [this.$mask, this.$padding, this.$margin, this.$toMask];

    // Singleton
    if ((window as any).__tailor_instance) {
      return (window as any).__tailor_instance as Tailor;
    }

    this.$tailor.append(this.$mask, this.$toMask, ...this.$rulers, this.$panel);

    document.body.append(this.$tailor);

    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);

    (window as any).__tailor_instance = this;
    console.log("Tailor initiated.");
  }

  // ----- CONTROLS ----- //

  enable() {
    this.$panel.innerHTML = `<span>Tailor</span> ready`;
    this.$tailor.style.display = "block";

    window.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("scroll", this.handleScrollAndResize);
    window.addEventListener("resize", this.handleScrollAndResize);
    // Click is using capture to prevent clicks on interactive elements
    // that way we can still measure without clicking and navigating from the page
    window.addEventListener("click", this.handleClick, true);
  }

  disable() {
    window.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("click", this.handleClick, true);
    window.removeEventListener("scroll", this.handleScrollAndResize);
    window.removeEventListener("resize", this.handleScrollAndResize);

    this.$elementsToReset.forEach(($element) => {
      $element.setAttribute("style", "");
    });
    this.resetRulers();

    this.$tailor.style.display = "none";
    this.$highlighted = null;
    this.selected = false;
    this.$tailor.classList.remove("__tailor--measuring");
    this.$to = null;
  }

  resetRulers() {
    this.$rulers.forEach((ruler) => {
      ruler.setAttribute("style", "");
      ruler.innerHTML = "";
    });
  }

  destroy() {
    this.disable();
    this.$tailor.remove();
    window.removeEventListener("keyup", this.handleKeyDown);
    window.removeEventListener("keydown", this.handleKeyUp);
  }

  // ----- EVENT HANDLERS ----- //

  handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === TOGGLE_KEY) {
      this.enable();
    }
  };

  handleKeyUp = (e: KeyboardEvent) => {
    if (e.key === TOGGLE_KEY) {
      this.disable();
    }
  };

  handleMouseMove = (e: MouseEvent) => {
    // TODO verify using EventTarget instead of casting to HTMLElement
    const $target = e.target as HTMLElement;

    if (this.selected) {
      if (this.$to !== $target && this.$highlighted && this.$highlighted !== $target) {
        this.measureDistance(this.$highlighted, $target);
      }
    } else if (this.$highlighted !== e.target) {
      this.$highlighted = $target;

      this.highlightElement(this.$highlighted);
      this.updatePanel(this.$highlighted);
    }
  };

  handleClick = (e: MouseEvent) => {
    e.preventDefault();
    this.selected = true;
    this.$tailor.classList.add("__tailor--measuring");
    this.$highlighted = e.target as HTMLElement;
    this.highlightElement(this.$highlighted);
    // reset to-mask when selecting a new element
    this.$toMask.setAttribute("style", "");
  };

  handleScrollAndResize = () => {
    if (this.$highlighted) {
      this.highlightElement(this.$highlighted);
    }
  };

  // ----- MAIN ----- //

  highlightElement($el: HTMLElement) {
    this.resetRulers();

    const style = getComputedStyle($el);
    const outerBox = $el.getBoundingClientRect();
    const box = this.selected ? outerBox : getBox($el);

    const { $tailor, $mask, $margin, $padding } = this;

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

    setPosition($mask, box.x, box.y, box.width, box.height);

    setPosition($tailor, outerBox.x, outerBox.y, outerBox.width, outerBox.height);

    $mask.style.paddingLeft = style.paddingLeft;
    $mask.style.paddingRight = style.paddingRight;
    $mask.style.paddingTop = style.paddingTop;
    $mask.style.paddingBottom = style.paddingBottom;

    $mask.style.transform = this.selected ? "" : style.transform;

    setPosition(
      $margin,
      -margin.left,
      -margin.top,
      box.width + margin.inline,
      box.height + margin.block
    );
    $margin.style.borderWidth = `${margin.top}px ${margin.right}px ${margin.bottom}px ${margin.left}px`;

    let marginHTML = "";
    let paddingHTML = "";
    const sides = ["top", "right", "bottom", "left"] as const;

    sides.forEach((side) => {
      if (margin[side]) {
        marginHTML += `<div class="__tailor-margin-label __tailor-margin-label--${side}">
          ${toFixed(margin[side])}
        </div>`;
      }
      if (padding[side]) {
        paddingHTML += `<div class="__tailor-padding-label __tailor-padding-label--${side}">
          ${toFixed(padding[side])}
        </div>`;
      }
    });

    $margin.innerHTML = marginHTML;
    $padding.innerHTML = paddingHTML;
  }

  measureDistance($from: HTMLElement, $to: HTMLElement) {
    const from = $from.getBoundingClientRect();
    const to = $to.getBoundingClientRect();
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

    if ($to) {
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

    this.$to = $to;

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

    setVerticalRuler($yRuler, ...positions.vertical1, true);
    setVerticalRuler($yRuler2, ...positions.vertical2, true);
    setHorizontalRuler($xRuler, ...positions.horizontal1, true);
    setHorizontalRuler($xRuler2, ...positions.horizontal2, true);

    setHorizontalRuler($xRulerHelper, ...positions.hHelper1);
    setHorizontalRuler($xRulerHelper2, ...positions.hHelper2);
    setVerticalRuler($yRulerHelper, ...positions.vHelper1);
    setVerticalRuler($yRulerHelper2, ...positions.vHelper2);
  }

  updatePanel($el: HTMLElement) {
    const style = getComputedStyle($el);

    let className = $el.getAttribute("class");

    if (className) {
      className = `.${$el.getAttribute("class")?.split(" ").join(".")}`;
    } else {
      className = "";
    }

    let font = style.fontFamily;
    let fontStack = style.fontFamily.split(", ");

    for (let i in fontStack) {
      if (document.fonts.check(`16px ${fontStack[i]}`)) {
        font = fontStack[i].replace(/\"/g, "");
        break;
      }
    }

    this.$panel.innerHTML = `
      <span>${$el.tagName.toLowerCase()}</span>${className}
      <div>
        ${style.width.replace("px", "")}x${style.height}<br/>
        ${font}<br/>
        ${style.fontSize} ${style.lineHeight}<br/>
        ${style.fontWeight} ${style.fontStyle}
      </div>
    `;
  }
}

export default Tailor;
