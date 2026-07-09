import React, { useState, useEffect } from 'react';
import styles from './AgreementSlider.module.css';

interface Props {
  value: number; // -1 to 1
  onChange: (val: number) => void;
  disabled?: boolean;
}

export function AgreementSlider({ value, onChange, disabled }: Props) {
  // Map internal -1 to 1 to slider 0 to 100 for range input
  const sliderValue = ((value + 1) / 2) * 100;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = parseFloat(e.target.value); // 0 to 100
    // Map back to -1 to 1
    const mapped = (raw / 50) - 1;
    onChange(mapped);
  };

  const getLabel = () => {
    if (value <= -0.75) return "Strongly Disagree";
    if (value <= -0.25) return "Disagree";
    if (value < 0.25) return "Neutral";
    if (value < 0.75) return "Agree";
    return "Strongly Agree";
  };

  return (
    <div className={styles.sliderContainer}>
      <div className={styles.track}>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={sliderValue}
          onChange={handleSliderChange}
          disabled={disabled}
          className={styles.slider}
          title={getLabel()}
        />
        <div className={styles.ticks}>
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>
      
      <div className={styles.labelContainer}>
        <span className={styles.currentLabel}>{getLabel()}</span>
      </div>
    </div>
  );
}
