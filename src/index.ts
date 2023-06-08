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

// function getBox($el: HTMLElement) {
//   let top = 0;
//   let left = 0;
//   let $element: HTMLElement | null = $el;
//   const width = $el.clientWidth;
//   const height = $el.clientHeight;

//   // Loop through the DOM tree
//   // and add it's parent's offset to get page offset
//   do {
//     top += $element.offsetTop || 0;
//     left += $element.offsetLeft || 0;
//     $element = $element.offsetParent;
//   } while ($element);

//   top += window.scrollY;
//   left += window.scrollX;

//   return {
//     x: left,
//     left,
//     y: top,
//     top,
//     width,
//     height,
//   };
// }

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

  if (addNumber && width > 0) {
    $el.innerHTML = `<div>${width}</div>`;
  }

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

  if (addNumber && height > 0) {
    $el.innerHTML = `<div>${height}</div>`;
  }

  setPosition($el, xStart - fixValue, yStart, 0, height);
}

class Tailor {
  $tailor: HTMLDivElement;
  $padding: HTMLDivElement;
  $margin: HTMLDivElement;

  $xRuler: HTMLDivElement;
  $xRuler2: HTMLDivElement;

  $yRuler: HTMLDivElement;
  $yRuler2: HTMLDivElement;

  $xRulerHelper: HTMLDivElement;
  $xRulerHelper2: HTMLDivElement;

  $yRulerHelper: HTMLDivElement;
  $yRulerHelper2: HTMLDivElement;

  $highlighted: HTMLElement | null = null;
  $to: HTMLElement | null = null;

  selected: boolean = false;

  constructor() {
    // Create elements
    this.$margin = div({ class: "__tailor-margin" });
    this.$padding = div({ class: "__tailor-padding" });

    this.$xRuler = div({ class: "__tailor-ruler __tailor-ruler--x" });
    this.$xRuler2 = div({ class: "__tailor-ruler __tailor-ruler--x" });

    this.$yRuler = div({ class: "__tailor-ruler __tailor-ruler--y" });
    this.$yRuler2 = div({ class: "__tailor-ruler __tailor-ruler--y" });

    this.$xRulerHelper = div({ class: "__tailor-ruler-helper __tailor-ruler-helper--x" });
    this.$xRulerHelper2 = div({ class: "__tailor-ruler-helper __tailor-ruler-helper--x" });

    this.$yRulerHelper = div({ class: "__tailor-ruler-helper __tailor-ruler-helper--y" });
    this.$yRulerHelper2 = div({ class: "__tailor-ruler-helper __tailor-ruler-helper--y" });

    this.$tailor = div({ class: "__tailor" });

    this.$tailor.append(
      this.$padding,
      this.$margin,
      this.$xRuler,
      this.$xRuler2,
      this.$yRuler,
      this.$yRuler2,
      this.$xRulerHelper,
      this.$xRulerHelper2,
      this.$yRulerHelper,
      this.$yRulerHelper2
    );

    // Singleton
    if ((window as any).__tailor_instance) {
      return (window as any).__tailor_instance as Tailor;
    }

    document.body.append(this.$tailor);

    window.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("click", this.handleClick);
    window.addEventListener("scroll", this.handleScrollAndResize);
    window.addEventListener("resize", this.handleScrollAndResize);

    (window as any).__tailor_instance = this;
    console.log("Tailor initiated.");
  }

  destroy() {
    this.$tailor.remove();

    window.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("click", this.handleClick);
    window.removeEventListener("scroll", this.handleScrollAndResize);
    window.removeEventListener("resize", this.handleScrollAndResize);
  }

  disable() {
    this.resetRulers();

    this.$tailor.style.display = "none";
    this.$highlighted = null;
    this.selected = false;
    this.$tailor.classList.remove("__tailor--measuring");

    // this.$tailor.classList.remove("__tailor--selected");

    if (this.$to) {
      this.$to.classList.remove("__tailor-to");
      this.$to = null;
    }
  }

  resetRulers() {
    const { $xRuler, $xRuler2, $yRuler, $yRuler2 } = this;

    $xRuler.innerHTML = "";
    $xRuler2.innerHTML = "";
    $yRuler.innerHTML = "";
    $yRuler2.innerHTML = "";
  }

  // ----- EVENT HANDLERS ----- //

  handleMouseMove = (e: MouseEvent) => {
    if (!e.metaKey) {
      this.disable();
      return;
    }

    this.$tailor.style.display = "block";

    // TODO verify using EventTarget instead of casting to HTMLElement
    const $target = e.target as HTMLElement;

    if (this.selected) {
      if (this.$to !== $target && this.$highlighted && this.$highlighted !== $target) {
        this.measureDistance(this.$highlighted, $target);
      }
    } else if (this.$highlighted !== e.target) {
      this.$highlighted = $target;

      this.highlightElement(this.$highlighted);
    }
  };

  handleClick = (e: MouseEvent) => {
    if (this.$highlighted) {
      e.preventDefault();
      this.selected = true;
      this.$tailor.classList.add("__tailor--measuring");
      this.$highlighted = e.target as HTMLElement;
      this.highlightElement(this.$highlighted);
      // TODO reset rulers
    }
  };

  handleScrollAndResize = () => {
    if (this.$highlighted) {
      this.highlightElement(this.$highlighted);
    }
  };

  // ----- MAIN ----- //

  highlightElement($el: HTMLElement) {
    const style = getComputedStyle($el);
    const box = $el.getBoundingClientRect();
    // const box = getBox($el);

    const { $tailor, $margin, $padding } = this;

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

    setPosition($tailor, box.x, box.y, box.width, box.height);

    $tailor.style.paddingLeft = style.paddingLeft;
    $tailor.style.paddingRight = style.paddingRight;
    $tailor.style.paddingTop = style.paddingTop;
    $tailor.style.paddingBottom = style.paddingBottom;

    setPosition(
      $margin,
      box.x - margin.left,
      box.y - margin.top,
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
          ${+margin[side].toFixed(1)}
        </div>`;
      }
      if (padding[side]) {
        paddingHTML += `<div class="__tailor-padding-label __tailor-padding-label--${side}">
          ${+padding[side].toFixed(1)}
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

    this.resetRulers();

    if (this.$to) {
      this.$to.classList.remove("__tailor-to");
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
    $to.classList.add("__tailor-to");

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
}

export default Tailor;
