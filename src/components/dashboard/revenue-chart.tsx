"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/money";

type MonthBucket = {
  month: string;
  label: string;
  invoicedCents: number;
  collectedCents: number;
};

const WIDTH = 640;
const HEIGHT = 260;
const PADDING_LEFT = 8;
const PADDING_RIGHT = 8;
const PADDING_TOP = 16;
const PADDING_BOTTOM = 32;
const BAR_GAP = 10;
const GROUP_GAP = 28;

export function RevenueChart({ data }: { data: MonthBucket[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  const maxValue = Math.max(1, ...data.flatMap((d) => [d.invoicedCents, d.collectedCents]));
  const plotWidth = WIDTH - PADDING_LEFT - PADDING_RIGHT;
  const plotHeight = HEIGHT - PADDING_TOP - PADDING_BOTTOM;
  const groupWidth = (plotWidth - GROUP_GAP * (data.length - 1)) / data.length;
  const barWidth = (groupWidth - BAR_GAP) / 2;

  function barHeight(cents: number) {
    return (cents / maxValue) * plotHeight;
  }

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center gap-4 text-sm">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#2a78d6" }} />
          Facturé
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#008300" }} />
          Encaissé
        </span>
      </div>

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label="Chiffre d'affaires facturé et encaissé par mois">
        <line
          x1={PADDING_LEFT}
          y1={HEIGHT - PADDING_BOTTOM}
          x2={WIDTH - PADDING_RIGHT}
          y2={HEIGHT - PADDING_BOTTOM}
          stroke="#c3c2b7"
          strokeWidth={1}
        />

        {data.map((bucket, i) => {
          const groupX = PADDING_LEFT + i * (groupWidth + GROUP_GAP);
          const invoicedH = barHeight(bucket.invoicedCents);
          const collectedH = barHeight(bucket.collectedCents);
          const baseline = HEIGHT - PADDING_BOTTOM;
          const isHovered = hovered === i;

          return (
            <g
              key={bucket.month}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered((h) => (h === i ? null : h))}
            >
              <rect
                x={groupX}
                y={PADDING_TOP}
                width={groupWidth}
                height={plotHeight}
                fill="transparent"
              />
              <rect
                x={groupX}
                y={baseline - invoicedH}
                width={barWidth}
                height={invoicedH}
                rx={3}
                fill="#2a78d6"
                opacity={isHovered ? 1 : 0.9}
              />
              <rect
                x={groupX + barWidth + BAR_GAP}
                y={baseline - collectedH}
                width={barWidth}
                height={collectedH}
                rx={3}
                fill="#008300"
                opacity={isHovered ? 1 : 0.9}
              />
              <text
                x={groupX + groupWidth / 2}
                y={HEIGHT - 12}
                textAnchor="middle"
                fontSize={10}
                fill="#898781"
              >
                {bucket.label}
              </text>

              {isHovered && (
                <g>
                  <rect
                    x={Math.min(Math.max(groupX - 20, 0), WIDTH - 140)}
                    y={PADDING_TOP}
                    width={140}
                    height={44}
                    rx={6}
                    fill="#0b0b0b"
                    opacity={0.9}
                  />
                  <text
                    x={Math.min(Math.max(groupX - 20, 0), WIDTH - 140) + 8}
                    y={PADDING_TOP + 17}
                    fontSize={10}
                    fill="#ffffff"
                  >
                    Facturé : {formatMoney(bucket.invoicedCents)}
                  </text>
                  <text
                    x={Math.min(Math.max(groupX - 20, 0), WIDTH - 140) + 8}
                    y={PADDING_TOP + 33}
                    fontSize={10}
                    fill="#ffffff"
                  >
                    Encaissé : {formatMoney(bucket.collectedCents)}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
