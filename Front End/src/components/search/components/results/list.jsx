import PropTypes from 'prop-types';
import React from "react";

class ResultList extends React.Component {
  render() {
    return (
      <div className="solr-result-grid">
        {this.props.children}
      </div>
    );
  }
}

ResultList.propTypes = {
  bootstrapCss: PropTypes.bool,
  children: PropTypes.array
};

export default ResultList;
