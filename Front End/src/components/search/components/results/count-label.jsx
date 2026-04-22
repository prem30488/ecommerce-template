import PropTypes from 'prop-types';
import React from "react";

class ResultCount extends React.Component {
  render() {
    const { numFound } = this.props;
    const label = numFound > 1 ? `Found ${numFound} results` :
      numFound === 1 ? "Found 1 result" : "No results found";

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          fontSize: '0.78rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          color: 'var(--search-muted)'
        }}>
          {numFound === 0 ? '⚠️' : '📋'}&nbsp;{label}
        </span>
        {numFound > 0 && (
          <span style={{
            background: 'var(--gradient-pill)',
            color: '#fff',
            borderRadius: 20,
            padding: '2px 10px',
            fontSize: '0.7rem',
            fontWeight: 700
          }}>{numFound}</span>
        )}
      </div>
    );
  }
}

ResultCount.propTypes = {
  numFound: PropTypes.number.isRequired
};

export default ResultCount;
