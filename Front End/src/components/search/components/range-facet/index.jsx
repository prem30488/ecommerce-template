import PropTypes from 'prop-types';
import React from "react";
import RangeSlider from "./range-slider";

class RangeFacet extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: props.value };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ value: nextProps.value });
  }

  facetsToRange() {
    const { facets } = this.props;
    return facets
      .filter((_, i) => i % 2 === 0)
      .map(v => parseInt(v))
      .sort((a, b) => a - b)
      .filter((_, i, arr) => i === 0 || i === arr.length - 1);
  }

  onRangeChange(range) {
    const bounds = this.facetsToRange();
    const lowerBound = bounds[0];
    const upperBound = bounds[1];
    const realRange = upperBound - lowerBound;
    const newState = {
      value: [
        Math.floor(range.lowerLimit * realRange) + lowerBound,
        Math.ceil(range.upperLimit * realRange) + lowerBound
      ]
    };
    if (range.refresh) {
      this.props.onChange(this.props.field, newState.value);
    } else {
      this.setState(newState);
    }
  }

  getPercentage(range, value) {
    const [lo, hi] = range;
    return (value - lo) / (hi - lo);
  }

  toggleExpand(ev) {
    if (!ev.target.className || ev.target.className.indexOf?.("clear-button") < 0) {
      this.props.onSetCollapse(this.props.field, !(this.props.collapse || false));
    }
  }

  render() {
    const { label, field, collapse } = this.props;
    const { value } = this.state;
    const range = this.facetsToRange();
    if (range.length < 2) return null;

    const filterRange = value.length > 0 ? value : range;
    const hasFilter = value.length > 0 && (value[0] !== range[0] || value[1] !== range[1]);

    return (
      <li
        id={`solr-range-facet-${field}`}
        style={{
          listStyle: 'none',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: 0,
        }}
      >
        {/* Header */}
        <header
          onClick={this.toggleExpand.bind(this)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 12px',
            cursor: 'pointer',
          }}
        >
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: 'var(--search-label)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <span style={{ color: 'var(--search-accent)', fontSize: '0.55rem' }}>
              {collapse ? '▶' : '▼'}
            </span>
            {label}
          </span>
          {hasFilter && (
            <button
              className="clear-button"
              onClick={() => this.props.onChange(field, [])}
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 6,
                color: '#f87171',
                padding: '2px 8px',
                fontSize: '0.65rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              ✕ Clear
            </button>
          )}
        </header>

        {/* Slider body */}
        {!collapse && (
          <div style={{ padding: '0 12px 12px' }}>
            <RangeSlider
              lowerLimit={this.getPercentage(range, filterRange[0])}
              onChange={this.onRangeChange.bind(this)}
              upperLimit={this.getPercentage(range, filterRange[1])}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 8,
            }}>
              <span style={{
                background: 'rgba(32,211,145,0.1)',
                color: 'var(--search-accent)',
                borderRadius: 6,
                padding: '2px 8px',
                fontSize: '0.72rem',
                fontWeight: 700,
              }}>₹{filterRange[0].toLocaleString('en-IN')}</span>
              <span style={{
                background: 'rgba(32,211,145,0.1)',
                color: 'var(--search-accent)',
                borderRadius: 6,
                padding: '2px 8px',
                fontSize: '0.72rem',
                fontWeight: 700,
              }}>₹{filterRange[1].toLocaleString('en-IN')}</span>
            </div>
          </div>
        )}
      </li>
    );
  }
}

RangeFacet.defaultProps = { value: [] };

RangeFacet.propTypes = {
  bootstrapCss: PropTypes.bool,
  collapse: PropTypes.bool,
  facets: PropTypes.array.isRequired,
  field: PropTypes.string.isRequired,
  label: PropTypes.string,
  onChange: PropTypes.func,
  onSetCollapse: PropTypes.func,
  value: PropTypes.array
};

export default RangeFacet;
