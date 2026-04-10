import PropTypes from 'prop-types';
import React from "react";

class Pending extends React.Component {
  render() {
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        fontSize: '0.75rem',
        color: 'var(--search-muted)',
        fontFamily: 'Inter, sans-serif',
      }}>
        <span style={{
          display: 'inline-block',
          width: 12,
          height: 12,
          border: '2px solid rgba(32,211,145,0.25)',
          borderTopColor: '#20d391',
          borderRadius: '50%',
          animation: 'as-spin 0.7s linear infinite',
        }} />
        Searching…
      </span>
    );
  }
}

Pending.propTypes = { bootstrapCss: PropTypes.bool };

export default Pending;
