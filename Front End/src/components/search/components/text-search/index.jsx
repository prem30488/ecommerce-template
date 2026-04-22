import PropTypes from 'prop-types';
import React from "react";

class TextSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: "" };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleInputKeyDown = this.handleInputKeyDown.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.toggleExpand = this.toggleExpand.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ value: nextProps.value });
  }

  handleInputChange(ev) { this.setState({ value: ev.target.value }); }
  handleInputKeyDown(ev) { if (ev.keyCode === 13) this.handleSubmit(); }
  handleSubmit() { this.props.onChange(this.props.field, this.state.value); }
  toggleExpand() { this.props.onSetCollapse(this.props.field, !(this.props.collapse || false)); }

  render() {
    const { label, collapse } = this.props;
    return (
      <li style={{
        listStyle: 'none',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '10px 12px'
      }}>
        <header
          onClick={this.toggleExpand}
          style={{ cursor: 'pointer', marginBottom: collapse ? 0 : 8 }}
        >
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: 'var(--search-label)',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <span style={{ color: 'var(--search-accent)', fontSize: '0.6rem' }}>
              {collapse ? '▶' : '▼'}
            </span>
            {label}
          </span>
        </header>
        <div style={{ display: collapse ? 'none' : 'block' }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input
              onChange={this.handleInputChange}
              onKeyDown={this.handleInputKeyDown}
              value={this.state.value || ""}
              placeholder={`Search ${label}…`}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8,
                color: 'var(--search-text)',
                padding: '7px 10px',
                fontSize: '0.8rem',
                outline: 'none',
                fontFamily: 'Inter, sans-serif',
              }}
            />
            <button
              onClick={this.handleSubmit}
              className="as-cyber-btn"
              style={{ '--content': "'🔍'", padding: '7px 18px' }}
            >
              <div className="left"></div>
              🔍
              <div className="right"></div>
            </button>
          </div>
        </div>
      </li>
    );
  }
}

TextSearch.defaultProps = { field: null };

TextSearch.propTypes = {
  bootstrapCss: PropTypes.bool,
  collapse: PropTypes.bool,
  field: PropTypes.string.isRequired,
  label: PropTypes.string,
  onChange: PropTypes.func,
  onSetCollapse: PropTypes.func
};

export default TextSearch;
