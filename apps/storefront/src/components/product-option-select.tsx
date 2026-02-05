import { HttpTypes } from "@medusajs/types";
import { clsx } from "clsx";
import React from "react";

type ProductOptionSelectProps = {
  option: HttpTypes.StoreProductOption;
  current: string | undefined;
  updateOption: (title: string, value: string) => void;
  title: string;
  disabled: boolean;
  "data-testid"?: string;
};

const ProductOptionSelect: React.FC<ProductOptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  "data-testid": dataTestId,
  disabled,
}) => {
  const filteredOptions = (option.values ?? []).map((v) => v.value);
  const isColorOption = title.toLowerCase() === "color";

  // Get selected color name for display
  const selectedColorName = isColorOption && current ? current : null;

  return (
    <div className="flex flex-col gap-y-3">
      <span className="text-[16px] font-medium text-neutral-900">
        {isColorOption && selectedColorName ? selectedColorName : title}
      </span>
      <div
        className="flex flex-wrap gap-2"
        data-testid={dataTestId}
      >
        {filteredOptions.map((v) => {
          const isActive = v === current;
          
          // Color option styling
          if (isColorOption) {
            return (
              <button
                onClick={() => updateOption(option.id, v)}
                key={v}
                className={clsx(
                  "rounded-full transition-all duration-200",
                  {
                    "h-6 w-14": isActive,
                    "h-6 w-6": !isActive,
                    "opacity-50 cursor-not-allowed": disabled,
                  }
                )}
                disabled={disabled}
                data-testid="option-button"
                title={v}
                style={{ backgroundColor: getColorValue(v) }}
              />
            );
          }

          // Default button styling
          return (
            <button
              onClick={() => updateOption(option.id, v)}
              key={v}
              className={clsx(
                "text-sm font-medium px-5 py-2.5 transition-all duration-200 min-w-[60px]",
                {
                  // Active state - brand blue
                  "bg-[#0A4AFD] text-white": isActive,
                  // Default state
                  "bg-neutral-100 text-neutral-700 hover:bg-neutral-200": !isActive && !disabled,
                  // Disabled state
                  "opacity-50 cursor-not-allowed": disabled,
                }
              )}
              disabled={disabled}
              data-testid="option-button"
            >
              {v}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Helper function to get color value from color name
function getColorValue(colorName: string): string {
  const colorMap: Record<string, string> = {
    // Grays & Neutrals
    black: "#1a1a1a",
    white: "#ffffff",
    charcoal: "#36454f",
    ghost: "#f8f8ff",
    pearl: "#f0ead6",
    oat: "#d9c8a9",
    gray: "#808080",
    grey: "#808080",
    silver: "#c0c0c0",
    
    // Blues
    blue: "#0066cc",
    "ultra marine": "#4166f5",
    ultramarine: "#4166f5",
    navy: "#000080",
    
    // Pinks & Reds
    pink: "#ffc0cb",
    "bubble gum": "#ffc1cc",
    "dusty rose": "#dcae96",
    rose: "#ff007f",
    red: "#cc0000",
    
    // Greens
    green: "#228b22",
    "mossy green": "#8a9a5b",
    olive: "#808000",
    
    // Earth tones
    brown: "#8b4513",
    tan: "#d2b48c",
    beige: "#f5f5dc",
    
    // Others
    yellow: "#ffd700",
    orange: "#ff8c00",
    purple: "#800080",
  };

  const normalized = colorName.toLowerCase();
  return colorMap[normalized] || "#e5e5e5";
}

export default ProductOptionSelect;
