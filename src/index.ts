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

class Tailor {
  $tailor: HTMLDivElement;
  $padding: HTMLDivElement;
  $margin: HTMLDivElement;
  $rulerX: HTMLDivElement;
  $rulerY: HTMLDivElement;
  $rulerHelperX: HTMLDivElement;
  $rulerHelperY: HTMLDivElement;

  $highlighted: HTMLElement | null = null;
  $to: HTMLElement | null = null;

  selected: boolean = false;

  constructor() {
    this.$margin = div({ class: "__tailor-margin" });
    this.$padding = div({ class: "__tailor-padding" });

    this.$rulerX = div({ class: "__tailor-measure __tailor-measure--x" });
    this.$rulerY = div({ class: "__tailor-measure __tailor-measure--y" });
    this.$rulerHelperX = div({ class: "__tailor-measure-helper __tailor-measure-helper--x" });
    this.$rulerHelperY = div({ class: "__tailor-measure-helper __tailor-measure-helper--y" });

    this.$tailor = div({ class: "__tailor" });

    this.$tailor.append(
      this.$padding,
      this.$margin,
      this.$rulerX,
      this.$rulerY,
      this.$rulerHelperX,
      this.$rulerHelperY
    );

    document.body.append(this.$tailor);

    window.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("click", this.handleClick);
    window.addEventListener("scroll", this.handleScrollAndResize);
    window.addEventListener("resize", this.handleScrollAndResize);
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

    // this.$tailor.classList.remove("__tailor--selected");

    if (this.$to) {
      this.$to.classList.remove("__tailor-to");
      this.$to = null;
    }
  }

  resetRulers() {
    const { $rulerX, $rulerY, $rulerHelperX, $rulerHelperY } = this;

    setPosition($rulerX, 0, 0, 0, 0);
    setPosition($rulerY, 0, 0, 0, 0);
    setPosition($rulerHelperX, 0, 0, 0, 0);
    setPosition($rulerHelperY, 0, 0, 0, 0);

    $rulerX.innerHTML = "";
    $rulerY.innerHTML = "";
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
    e.preventDefault();
    this.selected = true;
    this.$highlighted = e.target as HTMLElement;
    this.highlightElement(this.$highlighted);
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
    const { $rulerX, $rulerY, $rulerHelperX, $rulerHelperY } = this;

    if (this.$to) {
      this.$to.classList.remove("__tailor-to");
    }

    this.$to = $to;
    $to.classList.add("__tailor-to");

    const isAbove = from.bottom <= to.top;
    const isBelow = from.top >= to.bottom;
    const isLeft = from.right <= to.left;
    const isRight = from.left >= to.right;

    this.resetRulers();

    $rulerX.innerHTML = "";
    $rulerY.innerHTML = "";

    const xMid = from.left + from.width * 0.5;
    const yMid = from.top + from.height * 0.5;

    if (isAbove) {
      setPosition($rulerY, xMid, from.bottom, 0, to.top - from.bottom);
      $rulerY.innerHTML = `<div>${+(to.top - from.bottom).toFixed(1)}</div>`;

      if (xMid < to.left) {
        setPosition($rulerHelperX, xMid, to.top, to.left - xMid, 0);
      } else if (xMid > to.right) {
        setPosition($rulerHelperX, to.right, to.top, xMid - to.right, 0);
      }
    } else if (isBelow) {
      setPosition($rulerY, xMid, to.bottom, 0, from.top - to.bottom);
      $rulerY.innerHTML = `<div>${+(from.top - to.bottom).toFixed(1)}</div>`;

      if (xMid < to.left) {
        setPosition($rulerHelperX, xMid, to.bottom - 1, to.left - xMid, 0);
      } else if (xMid > to.right) {
        setPosition($rulerHelperX, to.right, to.bottom - 1, xMid - to.right, 0);
      }
    }

    if (isLeft) {
      setPosition($rulerX, from.right, yMid, to.left - from.right, 0);
      $rulerX.innerHTML = `<div>${+(to.left - from.right).toFixed(1)}</div>`;

      if (yMid < to.top) {
        setPosition($rulerHelperY, to.left, yMid, 0, to.top - yMid);
      } else if (yMid > to.bottom) {
        setPosition($rulerHelperY, to.left, to.bottom, 0, yMid - to.bottom);
      }
    } else if (isRight) {
      setPosition($rulerX, to.right, yMid, from.left - to.right, 0);
      $rulerX.innerHTML = `<div>${+(from.left - to.right).toFixed(1)}</div>`;

      if (yMid < to.top) {
        setPosition($rulerHelperY, to.right - 1, yMid, 0, to.top - yMid);
      } else if (yMid > to.bottom) {
        setPosition($rulerHelperY, to.right - 1, to.bottom, 0, yMid - to.bottom);
      }
    }
  }
}

new Tailor();
