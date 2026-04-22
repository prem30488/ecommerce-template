import PropTypes from 'prop-types';
import React from "react";
import ReactDOM from "react-dom";

class SortMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOpen: false };
    this.documentClickListener = this.handleDocumentClick.bind(this);
  }

  componentDidMount() { document.addEventListener("click", this.documentClickListener, false); }
  componentWillUnmount() { document.removeEventListener("click", this.documentClickListener, false); }

  toggleSelect() { this.setState(s => ({ isOpen: !s.isOpen })); }

  onSelect(field) {
    const found = this.props.sortFields.find(sf => sf.field === field && sf.value);
    this.props.onChange(field, found ? null : "asc");
  }

  handleDocumentClick(ev) {
    if (this.state.isOpen && !ReactDOM.findDOMNode(this).contains(ev.target)) {
      this.setState({ isOpen: false });
    }
  }

  render() {
    const { sortFields } = this.props;
    if (!sortFields || sortFields.length === 0) return null;

    const active = sortFields.find(sf => sf.value);

    const dropdownStyle = {
      position: 'absolute',
      top: '110%',
      right: 0,
      background: '#1a1f2e',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 10,
      minWidth: 140,
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      zIndex: 1000,
      overflow: 'hidden',
    };

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
        {/* Active sort direction buttons */}
        {active && (
          <div style={{ display: 'flex', gap: 4 }}>
            {['asc', 'desc'].map(dir => (
              <button
                key={dir}
                onClick={() => this.props.onChange(active.field, dir)}
                style={{
                  background: active.value === dir
                    ? 'var(--gradient-pill)'
                    : 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 6,
                  color: active.value === dir ? '#fff' : 'var(--search-muted)',
                  padding: '4px 10px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {dir === 'asc' ? '↑ Asc' : '↓ Desc'}
              </button>
            ))}
          </div>
        )}

        {/* Dropdown trigger */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={this.toggleSelect.bind(this)}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              color: 'var(--search-label)',
              padding: '6px 14px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <span>⇅</span>
            {active ? active.label : 'Sort by'}
            <span style={{ fontSize: '0.6rem', opacity: 0.6 }}>{this.state.isOpen ? '▲' : '▼'}</span>
          </button>

          {this.state.isOpen && (
            <div style={dropdownStyle}>
              {sortFields.map((sf, i) => (
                <div
                  key={i}
                  onClick={() => { this.onSelect(sf.field); this.toggleSelect(); }}
                  style={{
                    padding: '9px 14px',
                    fontSize: '0.8rem',
                    color: active && active.field === sf.field ? 'var(--search-accent)' : 'var(--search-label)',
                    cursor: 'pointer',
                    background: active && active.field === sf.field ? 'rgba(32,211,145,0.08)' : 'transparent',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    transition: 'background 0.15s',
                  }}
                >
                  {sf.label}
                </div>
              ))}
              {active && (
                <div
                  onClick={() => { this.props.onChange(active.field, null); this.toggleSelect(); }}
                  style={{
                    padding: '8px 14px',
                    fontSize: '0.75rem',
                    color: '#f87171',
                    cursor: 'pointer',
                    background: 'rgba(239,68,68,0.05)',
                  }}
                >
                  ✕ Clear sort
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
}

SortMenu.propTypes = {
  bootstrapCss: PropTypes.bool,
  onChange: PropTypes.func,
  sortFields: PropTypes.array
};

export default SortMenu;
