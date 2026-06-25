import React from "react";

interface KawaiiSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  baseColor?: string;
  className?: string;
}

export const KawaiiSlider: React.FC<KawaiiSliderProps> = ({ value, onChange, min = 0, max = 100, step = 1, baseColor, className = "" }) => {
  return (
    <div className={`rangeWrapper ${className}`}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="kawaii"
        style={{ "--base": baseColor } as React.CSSProperties}
      />
    </div>
  );
};
