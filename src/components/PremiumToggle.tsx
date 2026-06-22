import React from "react";

interface PremiumToggleProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export const PremiumToggle: React.FC<PremiumToggleProps> = ({ id, checked, onChange, className = "" }) => {
  return (
    <div className={`switch-container ${className}`}>
      <input 
        className="toggle-checkbox" 
        id={id} 
        type="checkbox" 
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <label className="switch" htmlFor={id}>
        <div className="toggle">
          <div className="led"></div>
        </div>
      </label>
    </div>
  );
};
