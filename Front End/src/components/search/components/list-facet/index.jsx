import PropTypes from 'prop-types';
import React from "react";

class ListFacet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filter: "",
      truncateFacetListsAt: props.truncateFacetListsAt,
    };
  }

  handleClick(value) {
    const foundIdx = this.props.value.indexOf(value);
    if (foundIdx < 0) {
      this.props.onChange(this.props.field, this.props.value.concat(value));
    } else {
      this.props.onChange(this.props.field, this.props.value.filter((v, i) => i !== foundIdx));
    }
  }

  toggleExpand() {
    this.props.onSetCollapse(this.props.field, !(this.props.collapse || false));
  }

  render() {
    const { label, facets, field, value, collapse } = this.props;
    const { truncateFacetListsAt, filter } = this.state;

    const facetCounts = facets.filter((_, i) => i % 2 === 1);
    const facetValues = facets.filter((_, i) => i % 2 === 0);
    const expanded = !(collapse || false);
    const hasActive = value && value.length > 0;

    const filtered = facetValues.filter(fv =>
      filter.length === 0 || fv.toLowerCase().includes(filter.toLowerCase())
    );

    const visible = truncateFacetListsAt > 0 ? filtered.slice(0, truncateFacetListsAt) : filtered;

    return (
      <li
        id={`solr-list-facet-${field}`}
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
              {expanded ? '▼' : '▶'}
            </span>
            {label}
          </span>
          {hasActive && (
            <span style={{
              background: 'linear-gradient(135deg,#20d391,#0ea5e9)',
              color: '#fff',
              borderRadius: 20,
              padding: '1px 7px',
              fontSize: '0.62rem',
              fontWeight: 700,
            }}>{value.length}</span>
          )}
        </header>

        {/* Facet values */}
        {expanded && (
          <div style={{ padding: '0 8px 8px' }}>
            {facetValues.length > 4 && (
              <input
                type="text"
                value={filter}
                onChange={e => this.setState({ filter: e.target.value })}
                placeholder="Filter values…"
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 7,
                  color: 'var(--search-text)',
                  padding: '6px 10px',
                  fontSize: '0.76rem',
                  outline: 'none',
                  marginBottom: 6,
                  fontFamily: 'Inter, sans-serif',
                  boxSizing: 'border-box',
                }}
              />
            )}

            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {visible.map((facetValue, i) => {
                const isActive = value.indexOf(facetValue) > -1;
                const count = facetCounts[facetValues.indexOf(facetValue)];
                return (
                  <li
                    key={`${facetValue}_${i}`}
                    onClick={() => this.handleClick(facetValue)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '6px 8px',
                      borderRadius: 7,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      color: isActive ? 'var(--search-accent)' : 'var(--search-muted)',
                      background: isActive ? 'rgba(32,211,145,0.08)' : 'transparent',
                      transition: 'all 0.15s',
                      marginBottom: 2,
                    }}
                  >
                    {/* Checkbox indicator */}
                    <span style={{
                      width: 14,
                      height: 14,
                      borderRadius: 4,
                      border: `1.5px solid ${isActive ? 'var(--search-accent)' : 'rgba(255,255,255,0.2)'}`,
                      background: isActive ? 'var(--search-accent)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontSize: '0.55rem',
                      color: '#fff',
                      transition: 'all 0.15s',
                    }}>
                      {isActive && '✓'}
                    </span>
                    <span style={{ flex: 1 }}>{facetValue}</span>
                    <span style={{
                      background: isActive ? 'rgba(32,211,145,0.2)' : 'rgba(255,255,255,0.06)',
                      color: isActive ? 'var(--search-accent)' : 'var(--search-muted)',
                      borderRadius: 20,
                      padding: '1px 7px',
                      fontSize: '0.65rem',
                      fontWeight: 600,
                    }}>{count}</span>
                  </li>
                );
              })}

              {truncateFacetListsAt > 0 && truncateFacetListsAt < facetValues.length && (
                <li
                  onClick={() => this.setState({ truncateFacetListsAt: -1 })}
                  style={{
                    padding: '6px 8px',
                    fontSize: '0.75rem',
                    color: 'var(--search-accent)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    opacity: 0.8,
                  }}
                >
                  + Show all ({facetValues.length})
                </li>
              )}
            </ul>

            {/* Clear button */}
            {hasActive && (
              <button
                onClick={() => this.props.onChange(field, [])}
                style={{
                  marginTop: 6,
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: 7,
                  color: '#f87171',
                  padding: '4px 10px',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                ✕ Clear {label}
              </button>
            )}
          </div>
        )}
      </li>
    );
  }
}

ListFacet.defaultProps = { value: [] };

ListFacet.propTypes = {
  bootstrapCss: PropTypes.bool,
  collapse: PropTypes.bool,
  facetSort: PropTypes.string,
  facets: PropTypes.array.isRequired,
  field: PropTypes.string.isRequired,
  label: PropTypes.string,
  onChange: PropTypes.func,
  onFacetSortChange: PropTypes.func,
  onSetCollapse: PropTypes.func,
  query: PropTypes.object,
  truncateFacetListsAt: PropTypes.number,
  value: PropTypes.array
};

export default ListFacet;
