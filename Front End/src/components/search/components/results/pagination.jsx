import PropTypes from 'prop-types';
import React from "react";

class Pagination extends React.Component {
  onPageChange(page, pageAmt) {
    if (page >= pageAmt || page < 0) return;
    this.props.onChange(page);
  }

  render() {
    const { query, results } = this.props;
    const { start, rows } = query;
    const { numFound } = results;
    const pageAmt = Math.ceil(numFound / rows);
    const currentPage = Math.floor(start / rows);

    if (pageAmt <= 1) return null;

    let rangeStart = Math.max(0, currentPage - 2);
    let rangeEnd = Math.min(pageAmt, rangeStart + 5);
    if (rangeEnd - rangeStart < 5 && rangeStart > 0) {
      rangeStart = Math.max(0, rangeEnd - 5);
    }

    const pages = [];
    for (let p = rangeStart; p < rangeEnd; p++) pages.push(p);

    const btnBase = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 36,
      height: 36,
      padding: '0 10px',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 8,
      fontSize: '0.82rem',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.18s',
      fontFamily: 'Inter, sans-serif',
    };

    const btnIdle = { ...btnBase, background: 'rgba(255,255,255,0.04)', color: 'var(--search-muted)' };
    const btnActive = { 
      ...btnBase, 
      background: 'var(--gradient-pill)', 
      border: 'none', 
      color: '#fff', 
      boxShadow: '0 2px 14px var(--color-primary-shadow)' 
    };
    const btnDisabled = { ...btnBase, background: 'transparent', color: 'rgba(255,255,255,0.2)', cursor: 'not-allowed', border: '1px solid rgba(255,255,255,0.04)' };

    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, padding: '4px 0', flexWrap: 'wrap' }}>
        <button
          style={currentPage === 0 ? btnDisabled : {}}
          className={currentPage === 0 ? "" : "as-cyber-btn"}
          onClick={() => this.onPageChange(0, pageAmt)}
          disabled={currentPage === 0}
          style={currentPage === 0 ? btnDisabled : { '--content': "'«'", minWidth: 40, height: 40, padding: 0 }}
        >
          {currentPage !== 0 && <div className="left"></div>}
          «
          {currentPage !== 0 && <div className="right"></div>}
        </button>

        <button
          className={currentPage === 0 ? "" : "as-cyber-btn"}
          onClick={() => this.onPageChange(currentPage - 1, pageAmt)}
          disabled={currentPage === 0}
          style={currentPage === 0 ? btnDisabled : { '--content': "'‹'", minWidth: 40, height: 40, padding: 0 }}
        >
          {currentPage !== 0 && <div className="left"></div>}
          ‹
          {currentPage !== 0 && <div className="right"></div>}
        </button>

        {pages.map(page => (
          <button
            key={page}
            className="as-cyber-btn"
            style={page === currentPage 
              ? { '--content': `'${page + 1}'`, minWidth: 40, height: 40, padding: 0, border: '2px solid #fff' } 
              : { '--content': `'${page + 1}'`, minWidth: 40, height: 40, padding: 0, opacity: 0.8 }}
            onClick={() => this.onPageChange(page, pageAmt)}
          >
            <div className="left"></div>
            {page + 1}
            <div className="right"></div>
          </button>
        ))}

        <button
          className={currentPage + 1 >= pageAmt ? "" : "as-cyber-btn"}
          onClick={() => this.onPageChange(currentPage + 1, pageAmt)}
          disabled={currentPage + 1 >= pageAmt}
          style={currentPage + 1 >= pageAmt ? btnDisabled : { '--content': "'›'", minWidth: 40, height: 40, padding: 0 }}
        >
          {currentPage + 1 < pageAmt && <div className="left"></div>}
          ›
          {currentPage + 1 < pageAmt && <div className="right"></div>}
        </button>

        <button
          className={currentPage === pageAmt - 1 ? "" : "as-cyber-btn"}
          onClick={() => this.onPageChange(pageAmt - 1, pageAmt)}
          disabled={currentPage === pageAmt - 1}
          style={currentPage === pageAmt - 1 ? btnDisabled : { '--content': "'»'", minWidth: 40, height: 40, padding: 0 }}
        >
          {currentPage !== pageAmt - 1 && <div className="left"></div>}
          »
          {currentPage !== pageAmt - 1 && <div className="right"></div>}
        </button>

        <span style={{
          fontSize: '0.72rem',
          color: 'var(--search-muted)',
          marginLeft: 8,
          fontFamily: 'Inter, sans-serif',
        }}>
          Page {currentPage + 1} of {pageAmt}
        </span>
      </div>
    );
  }
}

Pagination.propTypes = {
  bootstrapCss: PropTypes.bool,
  onChange: PropTypes.func,
  query: PropTypes.object,
  results: PropTypes.object
};

export default Pagination;
