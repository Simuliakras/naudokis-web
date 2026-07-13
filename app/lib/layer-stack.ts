// Ordering for stacked overlays (modals, sheets, drawers).
//
// Overlays can nest: the attribution prompt opens ON TOP of the already-open
// bridge modal. Both listen on `window`, so without an explicit order one Escape
// dismisses both, and both focus traps fight over Tab. A layer registers on open,
// and only the TOP layer acts.
//
// Push order — not DOM order — decides the top, which is what "the thing I opened
// last is the thing Escape closes" actually means.

export type Layer = { isTop: () => boolean; release: () => void };

function createLayerStack() {
  let stack: symbol[] = [];
  return function enter(): Layer {
    const id = Symbol("nk-layer");
    stack.push(id);
    return {
      isTop: () => stack[stack.length - 1] === id,
      release: () => {
        stack = stack.filter((entry) => entry !== id);
      },
    };
  };
}

// Separate stacks: a component enters both, and each must see itself as the top
// of its own kind. One shared stack would rank the same dialog twice.
export const enterEscapeLayer = createLayerStack();
export const enterFocusTrapLayer = createLayerStack();

// Ref-counted body scroll lock. The first layer locks; only the last one to leave
// unlocks — otherwise closing the prompt would let the page scroll behind the
// bridge modal still open underneath it.
let locks = 0;

export function lockBodyScroll(): () => void {
  if (locks === 0) {
    document.body.style.overflow = "hidden";
  }
  locks += 1;
  let released = false;
  return () => {
    if (released) {
      return;
    }
    released = true;
    locks -= 1;
    if (locks === 0) {
      document.body.style.overflow = "";
    }
  };
}
