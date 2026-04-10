import PropTypes from 'prop-types';
import React from "react";

class RangeSlider extends React.Component {
  render() {
    const { lowerLimit, upperLimit, onChange } = this.props;

    // Use percentage limits (0.0 to 1.0) multiplied to a workable 0-100 scale
    const min = 0;
    const max = 100;
    // Protect against NaN
    const lowVal = isNaN(lowerLimit) ? 0 : Math.round(lowerLimit * 100);
    const hiVal = isNaN(upperLimit) ? 100 : Math.round(upperLimit * 100);

    return (
      <div 
        className="html-range-slider" 
        style={{ 
          position: 'relative', 
          height: '30px', 
          width: '100%', 
          display: 'flex', 
          alignItems: 'center',
          marginTop: '6px'
        }}
      >
        {/* Track background */}
        <div style={{ 
          position: 'absolute', 
          width: '100%', 
          height: '6px', 
          background: 'rgba(255,255,255,0.08)', 
          borderRadius: '3px' 
        }}></div>
        
        {/* Active track filling between thumbs */}
        <div style={{ 
          position: 'absolute', 
          left: `${lowVal}%`, 
          right: `${100 - hiVal}%`, 
          height: '6px', 
          background: 'var(--search-accent)', 
          borderRadius: '3px' 
        }}></div>
        
        {/* Lower Thumb */}
        <input 
          type="range" 
          min={min} 
          max={max} 
          value={lowVal} 
          onChange={(e) => {
            let n = parseInt(e.target.value) / 100;
            if (n > upperLimit) n = upperLimit;
            onChange({ lowerLimit: n, upperLimit, refresh: false });
          }}
          onMouseUp={() => onChange({ lowerLimit, upperLimit, refresh: true })}
          onTouchEnd={() => onChange({ lowerLimit, upperLimit, refresh: true })}
          style={{ 
            position: 'absolute', 
            width: '100%', 
            pointerEvents: 'none', 
            WebkitAppearance: 'none', 
            appearance: 'none', 
            background: 'none',
            margin: 0,
            outline: 0
          }}
        />
        
        {/* Upper Thumb */}
        <input 
          type="range" 
          min={min} 
          max={max} 
          value={hiVal} 
          onChange={(e) => {
            let n = parseInt(e.target.value) / 100;
            if (n < lowerLimit) n = lowerLimit;
            onChange({ lowerLimit, upperLimit: n, refresh: false });
          }}
          onMouseUp={() => onChange({ lowerLimit, upperLimit, refresh: true })}
          onTouchEnd={() => onChange({ lowerLimit, upperLimit, refresh: true })}
          style={{ 
            position: 'absolute', 
            width: '100%', 
            pointerEvents: 'none', 
            WebkitAppearance: 'none', 
            appearance: 'none', 
            background: 'none',
            margin: 0,
            outline: 0
          }}
        />
      </div>
    );
  }
}

RangeSlider.propTypes = {
  lowerLimit: PropTypes.number,
  upperLimit: PropTypes.number,
  onChange: PropTypes.func.isRequired
};

export default RangeSlider;
