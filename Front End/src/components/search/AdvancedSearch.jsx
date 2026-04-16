import React, { Component } from 'react';
import { createRoot } from 'react-dom/client';
import SolrFacetedSearch from "./components/solr-faceted-search";
import defaultComponentPack from "./components/component-pack";
import { SolrClient } from "./api/solr-client";
import './advanced-search.css';

import { API_BASE_URL } from '../../constants';

export { SolrFacetedSearch, defaultComponentPack, SolrClient };

// ── Search fields ──────────────────────────────────────────
const fields = [
  { label: "Id", field: "id", type: "text" },
  { label: "Title", field: "title", type: "text" },
  { label: "In Stock?", field: "in_stock_s", type: "list-facet" },
  { label: "Categories", field: "categories_ss", type: "list-facet" },
  { label: "Form", field: "form_s", type: "list-facet" },
  { label: "Audience", field: "audience_s", type: "list-facet" },
  { label: "Price", field: "price_f", type: "range-facet" },
  { label: "Bestseller", field: "bestseller_s", type: "list-facet" },
  { label: "Featured", field: "featured_s", type: "list-facet" },
  { label: "Minimum Rating", field: "rating_f", type: "range-facet" },
  { label: "Discount", field: "discount_s", type: "list-facet" },
  { label: "Updated", field: "updated_at", type: "text" },
];

const sortFields = [
  { label: "Title", field: "title_s" },
  { label: "Price", field: "price_f" },
  { label: "Discount", field: "discount_s" },
];

// ── Premium Stats Bar ──────────────────────────────────────
const STATS = [
  { icon: "🔍", label: "AI-powered Search" },
  { icon: "⚡", label: "Real-time Filters" },
  { icon: "📦", label: "Live Inventory" },
];

class AdvancedSearch extends Component {
  constructor(props) {
    super(props);
    this.state = { test: false };
    this.editUser = this.editUser.bind(this);
  }

  editUser(id) { }

  componentDidMount() {
    this.timer = setInterval(
      () => this.setState(prev => ({ test: !prev.test })),
      2000
    );

    const container = document.getElementById("solrDiv");
    if (container && !this.solrRoot) {
      this.solrRoot = createRoot(container);
    }

    new SolrClient({
      idField: "id",
      url: `${API_BASE_URL}/api/solr-proxy/hanley/select`,
      searchFields: fields,
      sortFields: sortFields,
      pageStrategy: "paginate",
      onChange: (state, handlers) => {
        if (this.solrRoot) {
          this.solrRoot.render(
            <React.Fragment>
              <SolrFacetedSearch
                {...state}
                {...handlers}
                bootstrapCss={true}
                onSelectDoc={(doc) => this.editUser(doc.id)}
              />
            </React.Fragment>
          );
        }
      }
    }).initialize();
  }

  componentWillUnmount() {
    if (this.timer) clearInterval(this.timer);
  }

  render() {
    return (
      <div className="as-page">
        {/* Hero ------------------------------------------------ */}
        <div className="as-hero">
          <h1>Advanced Product Search</h1>
          <p>Discover products with precision filtering powered by Apache Solr</p>
          <div className="as-stats-row">
            {STATS.map((s, i) => (
              <div key={i} className="as-stat-item">
                <span className="as-stat-icon">{s.icon}</span>
                {s.label}
              </div>
            ))}
          </div>
        </div>

        {/* Solr renders here — we rely on its own grid classes ── */}
        <div id="solrDiv" className="as-glass as-main-container" />
      </div>
    );
  }
}

export default AdvancedSearch;
