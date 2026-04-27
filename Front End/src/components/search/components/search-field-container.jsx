import PropTypes from 'prop-types';
import React from "react";

class SearchFieldContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: true
    };
    this.toggleCollapse = this.toggleCollapse.bind(this);
  }

  toggleCollapse() {
    this.setState(prevState => ({
      collapsed: !prevState.collapsed
    }));
  }

  render() {
    const { onNewSearch } = this.props;
    const { collapsed } = this.state;
    return (
      <div className={`as-sidebar-wrapper ${collapsed ? 'is-collapsed' : ''}`}>
        <div className="as-glass as-sidebar-inner">
          {/* Sidebar header */}
          <div className="as-sidebar-header-toggle" onClick={this.toggleCollapse}>
            <div className="as-sidebar-header-title">
              <span>🎛️</span>
              <strong>Filters</strong>
              <span className="as-sidebar-chevron">
                {collapsed ? '▶' : '▼'}
              </span>
            </div>
            
            <button
              onClick={(e) => { e.stopPropagation(); onNewSearch(); }}
              className="as-cyber-btn reset-btn"
              style={{ '--content': "'Reset'" }}
            >
              <div className="left"></div>
              Reset
              <div className="right"></div>
            </button>
          </div>

          {/* Filters list */}
          <div className="as-sidebar-content-wrapper">
            <ul className="solr-search-fields">
              {this.props.children}
            </ul>
          </div>
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
