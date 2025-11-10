import { useLoading } from "@/helpers/Loading";
import React, {
  useState,
  useEffect,
  useRef,
  CSSProperties,
  ReactNode,
} from "react";

interface RescaleTextProps {
  children: ReactNode;
  style?: CSSProperties;
  checkHeight?: boolean;
  maxFontSize?: number;
  id?: string;
  ellipsis?: boolean;
  ellipsisChars?: string;
}

const RescaleText: React.FC<RescaleTextProps> = ({
  children,
  style,
  checkHeight = false,
  maxFontSize = 100,
  id = "no-id",
  ellipsis = false,
  ellipsisChars = "...",
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [fontSize, setFontSize] = useState<number>(maxFontSize);
  const [resizeFinished, setResizeFinished] = useState<boolean>(false);
  const [displayText, setDisplayText] = useState<string>(() =>
    typeof children === "string" ? children : String(children)
  );

  const setLoading = useLoading({ id });

  useEffect(() => {
    const resizeFont = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        const parent = container.parentNode as HTMLElement;
        const initialFontSize = maxFontSize;

        // If ellipsis mode is enabled, don't resize font: instead truncate text
        if (ellipsis) {
          const fullText =
            typeof children === "string" ? children : String(children);
          let truncated = fullText;

          // For width-only fitting, prevent wrapping to measure single-line width
          const prevWhiteSpace = container.style.whiteSpace;
          container.style.whiteSpace = checkHeight ? "normal" : "nowrap";

          // Place the full text first
          container.textContent = truncated;

          // Reduce characters until it fits
          while (
            (checkHeight && container.scrollHeight > parent.clientHeight) ||
            container.scrollWidth > parent.clientWidth
          ) {
            if (truncated.length === 0) break;
            truncated = truncated.slice(0, -1).trim();
            container.textContent = truncated + ellipsisChars;
          }

          // restore white-space style
          container.style.whiteSpace = prevWhiteSpace;

          setDisplayText(
            truncated === fullText ? fullText : truncated + ellipsisChars
          );
          setResizeFinished(true);
          setLoading(false);
          return;
        }

        // Fallback/default: scale the font down until it fits
        let newFontSize = initialFontSize;
        container.style.fontSize = `${newFontSize}px`;

        // Adjust font size until the text fits within the container's parent width
        while (
          (checkHeight && container.scrollHeight > parent.clientHeight) ||
          container.scrollWidth > parent.clientWidth
        ) {
          newFontSize -= 0.25;
          if (newFontSize <= 0) break;
          container.style.fontSize = `${newFontSize}px`;
        }

        setFontSize(newFontSize);
        setResizeFinished(true);
        setLoading(false);
      }
    };

    resizeFont();
    window.addEventListener("resize", resizeFont);

    return () => window.removeEventListener("resize", resizeFont);
  }, [children, maxFontSize, checkHeight, ellipsis, ellipsisChars, setLoading]);

  return (
    <div
      ref={containerRef}
      style={{
        ...style,
        fontSize: ellipsis ? undefined : `${fontSize}px`,
        overflow: "hidden",
        opacity: resizeFinished ? 1 : 0,
      }}
    >
      {ellipsis ? displayText : children}
    </div>
  );
};

export default RescaleText;
