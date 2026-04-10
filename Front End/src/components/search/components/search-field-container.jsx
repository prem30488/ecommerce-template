import PropTypes from 'prop-types';
import React from "react";

class SearchFieldContainer extends React.Component {
  render() {
    const { onNewSearch } = this.props;
    return (
      <div style={{
        width: '280px',
        flexShrink: 0,
        position: 'sticky',
        top: '100px',
        alignSelf: 'start'
      }}>
        <div className="as-glass" style={{ overflow: 'hidden' }}>
          {/* Sidebar header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 18px',
            borderBottom: '1px solid var(--search-border)',
            background: 'linear-gradient(135deg,rgba(32,211,145,0.07),rgba(14,165,233,0.05))'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.9rem' }}>🎛️</span>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                color: 'var(--search-accent)'
              }}>Filters</span>
            </div>
            <button
              onClick={onNewSearch}
              style={{
                background: 'linear-gradient(135deg,#20d391,#0ea5e9)',
                border: 'none',
                borderRadius: 20,
                color: '#fff',
                padding: '5px 13px',
                fontSize: '0.7rem',
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '0.5px',
                boxShadow: '0 2px 12px rgba(32,211,145,0.3)',
                transition: 'opacity 0.15s'
              }}
            >
              Reset
            </button>
          </div>

          {/* Filters list */}
          <ul className="solr-search-fields" style={{
            listStyle: 'none',
            margin: 0,
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}>
            {this.props.children}
          </ul>
        </div>
      </div>
    );
  }
}

SearchFieldContainer.propTypes = {
  bootstrapCss: PropTypes.bool,
  children: PropTypes.array,
  onNewSearch: PropTypes.func
};

export default SearchFieldContainer;
