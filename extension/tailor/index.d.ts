declare class Tailor {
    $elementsToReset: HTMLDivElement[];
    $rulers: HTMLDivElement[];
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
    $current: HTMLElement | null;
    $measureTo: HTMLElement | null;
    selected: boolean;
    constructor();
    enable(): void;
    disable(): void;
    resetRulers(): void;
    destroy(): void;
    handleKeyDown: (e: KeyboardEvent) => void;
    handleKeyUp: (e: KeyboardEvent) => void;
    handleMouseMove: (e: MouseEvent) => void;
    handleClick: (e: MouseEvent) => void;
    highlightElement($el: HTMLElement): void;
    measureDistance($current: HTMLElement, $measureTo: HTMLElement): void;
    updatePanel($el: HTMLElement | SVGElement): void;
}
export default Tailor;