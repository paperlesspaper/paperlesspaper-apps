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
}

const RescaleText: React.FC<RescaleTextProps> = ({
  children,
  style,
  checkHeight = false,
  maxFontSize = 100,
  id = "no-id",
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [fontSize, setFontSize] = useState<number>(maxFontSize);
  const [resizeFinished, setResizeFinished] = useState<boolean>(false);

  const setLoading = useLoading({ id });

  useEffect(() => {
    const resizeFont = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        const parent = container.parentNode as HTMLElement;
        const initialFontSize = maxFontSize;

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
  }, [children, maxFontSize, checkHeight]);

  return (
    <div
      ref={containerRef}
      style={{
        ...style,
        fontSize: `${fontSize}px`,
        overflow: "hidden",
        opacity: resizeFinished ? 1 : 0,
      }}
    >
      {children}
    </div>
  );
};

export default RescaleText;
