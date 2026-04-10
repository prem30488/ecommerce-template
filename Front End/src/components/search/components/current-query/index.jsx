import PropTypes from 'prop-types';
import React from "react";

const tagStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  background: 'rgba(32,211,145,0.1)',
  border: '1px solid rgba(32,211,145,0.25)',
  color: 'var(--search-accent)',
  borderRadius: 20,
  padding: '3px 10px',
  fontSize: '0.73rem',
  fontWeight: 600,
  cursor: 'pointer',
  margin: '3px',
  transition: 'all 0.15s',
  fontFamily: 'Inter, sans-serif',
};

class CurrentQuery extends React.Component {
  removeListFacetValue(field, values, value) {
    const foundIdx = values.indexOf(value);
    if (foundIdx > -1) this.props.onChange(field, values.filter((v, i) => i !== foundIdx));
  }

  removeRangeFacetValue(field) { this.props.onChange(field, []); }
  removeTextValue(field) { this.props.onChange(field, ""); }

  renderFieldValues(searchField) {
    switch (searchField.type) {
      case "list-facet":
        return searchField.value.map((val, i) => (
          <span
            key={i}
            style={tagStyle}
            onClick={() => this.removeListFacetValue(searchField.field, searchField.value, val)}
            title="Remove filter"
          >
            {searchField.label}: <strong>{val}</strong>
            <span style={{ opacity: 0.6, fontSize: '0.7rem' }}>✕</span>
          </span>
        ));

      case "range-facet":
        return (
          <span
            style={tagStyle}
            onClick={() => this.removeRangeFacetValue(searchField.field)}
            title="Remove filter"
          >
            {searchField.label}: <strong>₹{searchField.value[0]} – ₹{searchField.value[1]}</strong>
            <span style={{ opacity: 0.6, fontSize: '0.7rem' }}>✕</span>
          </span>
        );

      case "text":
        return (
          <span
            style={tagStyle}
            onClick={() => this.removeTextValue(searchField.field)}
            title="Remove filter"
          >
            {searchField.label}: <strong>{searchField.value}</strong>
            <span style={{ opacity: 0.6, fontSize: '0.7rem' }}>✕</span>
          </span>
        );
    }
    return null;
  }

  render() {
    const { query } = this.props;
    const active = query.searchFields.filter(sf => sf.value && sf.value.length > 0);
    if (active.length === 0) return null;

    return (
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 4,
        padding: '8px 4px',
      }}>
        <span style={{
          fontSize: '0.7rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
          color: 'var(--search-muted)',
          marginRight: 4
        }}>Active filters:</span>
        {active.map((sf, i) => (
          <span key={i}>{this.renderFieldValues(sf)}</span>
        ))}
      </div>
    );
  }
}

CurrentQuery.propTypes = {
  bootstrapCss: PropTypes.bool,
  onChange: PropTypes.func,
  query: PropTypes.object
};

export default CurrentQuery;
