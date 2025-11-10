import { useLoading } from "@/helpers/Loading";
import React, {
  useLayoutEffect,
  useRef,
  useState,
  CSSProperties,
  ReactNode,
} from "react";
import { texLinebreakDOM } from "tex-linebreak2";
import Hypher from "hypher";
import dePatterns from "hyphenation.de";

/** Props: combines RescaleText controls with RaggedParagraph options */
interface RaggedParagraphProps {
  children: ReactNode; // plain text preferred
  lang?: string; // default "de"
  style?: CSSProperties; // extra styles
  /** If true, also fit the parent HEIGHT (multi-line). If false, width-only. */
  checkHeight?: boolean;
  /** Start size to scale down from (when ellipsis=false). */
  maxFontSize?: number;
  /** Optional ID for your useLoading hook */
  id?: string;
  /** If true, do NOT scale the font; instead truncate text with ellipsisChars to fit. */
  ellipsis?: boolean;
  /** Ellipsis string (default '...'). */
  ellipsisChars?: string;
}

/* Build German hyphenator */
const h = new Hypher(dePatterns);
const SHY = "\u00AD";

const hyphenateWord = (word: string) => h.hyphenate(word).join(SHY);
const stripShy = (s: string) => s.replace(/\u00AD/g, "");

/* Idempotently insert soft hyphens into all text nodes */
/*
function addSoftHyphensToTextNodes(rootEl: HTMLElement) {
  const walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  nodes.forEach((node) => {
    const original = node.nodeValue || "";
    if (!original.trim()) return;
    // 1) Remove any previous soft hyphens from earlier runs
    const clean = stripShy(original);
    // 2) Insert soft hyphens for each letter-sequence word
    const hyph = clean.replace(/\p{L}+/gu, (m) => hyphenateWord(m));
    if (hyph !== original) node.nodeValue = hyph;
  });
}
  */
function addSoftHyphensToTextNodes(rootEl: HTMLElement) {
  const walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  nodes.forEach((node) => {
    const original = node.nodeValue || "";
    if (!original.trim()) return;
    // 1) Remove any previous soft hyphens from earlier runs
    const clean = stripShy(original);
    // 2) Insert soft hyphens for each letter-sequence word
    const hyph = clean.replace(/[a-zA-ZÀ-ÿĀ-žА-я]+/g, (m) => hyphenateWord(m));
    if (hyph !== original) node.nodeValue = hyph;
  });
}

/* Fully reset the element to the original plain text */
function resetToOriginal(el: HTMLElement) {
  const raw = el.dataset.kpOriginal || "";
  el.textContent = raw; // single text node so tex-linebreak2 starts clean
}

/** Ensure we have a plain string from children */
function toPlainText(children: ReactNode): string {
  return typeof children === "string" ? children : String(children ?? "");
}

const RaggedParagraph: React.FC<RaggedParagraphProps> = ({
  children,
  lang = "de",
  style,
  checkHeight = false,
  maxFontSize = 100,
  id = "no-id",
  ellipsis = false,
  ellipsisChars = "...",
}) => {
  const ref = useRef<HTMLParagraphElement | null>(null);
  const [resizeFinished, setResizeFinished] = useState(false);
  const setLoading = useLoading({ id });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const parent = (el.parentElement || el) as HTMLElement;
    const text = toPlainText(children);

    let destroyed = false;
    setResizeFinished(false);
    // store original (plain) text for idempotent resets
    el.dataset.kpOriginal = text;

    const overflows = () => {
      const heightOverflow =
        checkHeight && el.scrollHeight > parent.clientHeight;
      const widthOverflow = el.scrollWidth > parent.clientWidth + 100;
      console.log(
        `overflow check: heightOverflow=${heightOverflow}, widthOverflow=${widthOverflow}, scrollHeight=${el.scrollHeight}, clientHeight=${parent.clientHeight}, scrollWidth=${el.scrollWidth}, clientWidth=${parent.clientWidth}`
      );
      return heightOverflow || widthOverflow;
    };

    const doEllipsis = () => {
      // Ellipsis mode: do not scale font; truncate characters to fit.
      const prevWhiteSpace = el.style.whiteSpace;
      el.style.whiteSpace = checkHeight ? "normal" : "nowrap";

      let truncated = text;
      el.textContent = truncated;

      let safety = 20000;
      while (overflows() && truncated.length > 0 && safety-- > 0) {
        truncated = truncated.slice(0, -1).trimEnd();
        el.textContent = truncated + ellipsisChars;
      }

      el.style.whiteSpace = prevWhiteSpace;
    };

    const layoutRaggedWithHyphenation = () => {
      // Start from clean text each pass
      resetToOriginal(el);
      addSoftHyphensToTextNodes(el);
      texLinebreakDOM([el], {
        justify: false,
        align: "left",
        updateOnWindowResize: false, // we handle resize ourselves
        // Optional tuning:
        // softHyphenPenalty: 50,
        // forceOverflowToBreak: true,
        // stripSoftHyphensFromOutputText: true,
      });
    };

    const doScale = () => {
      // Rescale mode: scale font down until it fits (height and/or width)
      let size = maxFontSize;
      el.style.fontSize = `${size}px`;

      let safety = 800;
      while (safety-- > 0) {
        layoutRaggedWithHyphenation();
        if (!overflows()) break;
        size -= 0.5;
        if (size <= 0) break;
        el.style.fontSize = `${size}px`;
      }
    };

    const run = async () => {
      // Wait for fonts so measurements are accurate
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ("fonts" in document && (document as any).fonts?.ready) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (document as any).fonts.ready;
        } catch {
          /* ignore */
        }
      }
      if (destroyed) return;

      if (ellipsis) {
        doEllipsis();
      } else {
        doScale();
      }

      setResizeFinished(true);
      setLoading(false);
    };

    // trigger initial run
    run();

    // reflow on element or parent size changes
    const ro = new ResizeObserver(() => run());
    ro.observe(el);
    if (parent) ro.observe(parent);

    return () => {
      destroyed = true;
      ro.disconnect();
    };
    // include all inputs that affect layout
  }, [children, checkHeight, ellipsis, ellipsisChars, maxFontSize, setLoading]);

  return (
    <p
      ref={ref}
      lang={lang}
      style={{
        ...style,
        margin: 0,
        hyphens: "manual", // don't let CSS fight our soft hyphen points
        overflow: "hidden",
        opacity: resizeFinished ? 1 : 0, // avoid flashing un-laid-out text
      }}
    />
  );
};

export default RaggedParagraph;
