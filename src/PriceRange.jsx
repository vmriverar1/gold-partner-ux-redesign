import * as Slider from '@radix-ui/react-slider';
import { DEFAULT_FILTERS } from './lib/domain.js';

const priceText = value => `S/ ${value.toLocaleString('es-PE')}`;

export function PriceRange({ min, max, onChange }) {
  const handleBoundaryKey = (event, field) => {
    if (event.key !== 'Home' && event.key !== 'End') return;
    // Home / End act on the focused limit, not Radix's first / last thumb.
    event.preventDefault();
    const value = field === 'min'
      ? (event.key === 'Home' ? DEFAULT_FILTERS.min : max)
      : (event.key === 'Home' ? min : DEFAULT_FILTERS.max);
    onChange({ min, max, [field]: value });
  };

  return <Slider.Root
    className="price-range"
    role="group"
    aria-label="Rango de presupuesto"
    min={DEFAULT_FILTERS.min}
    max={DEFAULT_FILTERS.max}
    step={100}
    preserveThumbOrder
    value={[min, max]}
    onValueChange={([nextMin, nextMax]) => onChange({ min: nextMin, max: nextMax })}
  >
    <Slider.Track className="price-range-track">
      <Slider.Range className="price-range-selection" />
    </Slider.Track>
    <Slider.Thumb
      className="price-range-thumb"
      aria-label="Ajustar presupuesto mínimo"
      aria-valuemax={max}
      aria-valuetext={priceText(min)}
      onKeyDown={event => handleBoundaryKey(event, 'min')}
    />
    <Slider.Thumb
      className="price-range-thumb"
      aria-label="Ajustar presupuesto máximo"
      aria-valuemin={min}
      aria-valuetext={priceText(max)}
      onKeyDown={event => handleBoundaryKey(event, 'max')}
    />
  </Slider.Root>;
}
