import { CSSProperties, ReactNode } from "react";

interface Props {
    children: ReactNode;
    /** Hex background colour (e.g. "#16a34a"). Border + tinted fill + darker text. */
    color?: string;
    /** Extra classes, used for Tailwind-coloured pills when no hex colour is set. */
    className?: string;
}

/** Lighten a hex colour by mixing each channel towards white. */
function shade(hex: string, amount = 0.6): string {
    const m = hex.replace("#", "").match(/.{2}/g);
    if (!m || m.length < 3) return hex;
    const [r, g, b] = m.map((c) => {
        const v = parseInt(c, 16);
        return Math.round(v + (255 - v) * amount);
    });
    return `rgb(${r}, ${g}, ${b})`;
}

export default function Pill({ children, color, className }: Props) {
    const style: CSSProperties = color
        ? {
              borderColor: color,
              backgroundColor: `${color}80`,
              color: shade(color),
          }
        : {};

    return (
        <span
            style={style}
            className={`shrink-0 inline-flex items-center text-sm font-semibold px-3 py-1 rounded-full ${
                color ? "border" : ""
            } ${className ?? ""}`}
        >
            {children}
        </span>
    );
}
