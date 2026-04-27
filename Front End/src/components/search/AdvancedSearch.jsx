import React, { Component } from 'react';
import { createRoot } from 'react-dom/client';
import SolrFacetedSearch from "./components/solr-faceted-search";
import defaultComponentPack from "./components/component-pack";
import { SolrClient } from "./api/solr-client";
import solrQuery from "./api/solr-query";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import './advanced-search.css';

import { API_BASE_URL } from '../../constants';
import { COMPANY_INFO } from '../../constants/companyInfo';
import LinearProgress from '../../common/LinearProgress';
import SEO from "../../components/SEO";
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
  { label: "Minimum Rating", field: "rating_f", type: "list-facet" },
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
    this.state = { test: false, loading: true };
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

    const handleCsvExport = async (state) => {
      const { query } = state;
      const params = solrQuery({ ...query, rows: 10000 }, { wt: "json", facet: "off" });
      const separator = query.url.includes("?") ? "&" : "?";
      const exportUrl = `${query.url.replace(/\/$/, '')}${separator}${params}`;

      try {
        const response = await fetch(exportUrl);
        const data = await response.json();
        const docs = data.response.docs;

        const csvRows = [];
        // Company Info
        csvRows.push(`Company Name,${COMPANY_INFO.name}`);
        csvRows.push(`Address,"${COMPANY_INFO.address1}, ${COMPANY_INFO.address2}, ${COMPANY_INFO.city}, ${COMPANY_INFO.state} - ${COMPANY_INFO.pinCode}"`);
        csvRows.push(`Email,${COMPANY_INFO.email}`);
        csvRows.push(`Phone,${COMPANY_INFO.phone1}`);
        csvRows.push(""); // Empty line

        // Columns
        const headers = ["ID", "Title", "Brand", "Price", "Stock", "Rating", "Categories"];
        csvRows.push(headers.join(","));

        // Data Rows
        docs.forEach(d => {
          const row = [
            d.id,
            `"${String(d.title_s || d.title || '').replace(/"/g, '""')}"`,
            `"${String(d.brand || '').replace(/"/g, '""')}"`,
            d.price_f || d.price,
            d.stock || 0,
            d.rating_f || 0,
            `"${String((d.categories_ss || d.categories || []).join(', ')).replace(/"/g, '""')}"`
          ];
          csvRows.push(row.join(","));
        });

        const csvString = csvRows.join("\n");
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `search_results_${new Date().getTime()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error("CSV Export failed:", err);
        alert("Failed to generate CSV.");
      }
    };

    const handlePdfExport = async (state) => {
      const { query } = state;
      const params = solrQuery({ ...query, rows: 1000 }, { wt: "json", facet: "off" });
      const separator = query.url.includes("?") ? "&" : "?";
      const exportUrl = `${query.url.replace(/\/$/, '')}${separator}${params}`;

      try {
        const response = await fetch(exportUrl);
        const data = await response.json();
        const docs = data.response.docs;

        const doc = new jsPDF('l', 'pt');

        // Company Branding
        doc.setFontSize(18);
        doc.setTextColor(44, 62, 80);
        doc.text(COMPANY_INFO.name, 40, 45);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`${COMPANY_INFO.address1}, ${COMPANY_INFO.address2}`, 40, 60);
        doc.text(`${COMPANY_INFO.city}, ${COMPANY_INFO.state} - ${COMPANY_INFO.pinCode}`, 40, 72);
        doc.text(`Email: ${COMPANY_INFO.email} | Phone: ${COMPANY_INFO.phone1}`, 40, 84);

        doc.setLineWidth(1);
        doc.setDrawColor(200);
        doc.line(40, 95, 800, 95);

        const tableColumn = ["ID", "Title", "Brand", "Price", "Stock", "Rating", "Categories"];
        const tableRows = docs.map(d => [
          d.id,
          d.title_s || d.title,
          d.brand || '',
          d.price_f || d.price,
          d.stock || 0,
          d.rating_f || 0,
          (d.categories_ss || d.categories || []).join(', ')
        ]);

        doc.autoTable({
          head: [tableColumn],
          body: tableRows,
          startY: 110,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [44, 62, 80] },
          alternateRowStyles: { fillColor: [245, 245, 245] }
        });

        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setTextColor(150);
          doc.text(`Page ${i} of ${pageCount} | Generated on ${new Date().toLocaleString()}`, 40, doc.internal.pageSize.height - 20);
        }

        doc.save(`search_results_${new Date().getTime()}.pdf`);
      } catch (err) {
        console.error("PDF Export failed:", err);
        alert("Failed to generate PDF. Please try again.");
      }
    };

    new SolrClient({
      idField: "id",
      url: `${API_BASE_URL}/api/solr-proxy/hanley/select`,
      searchFields: fields,
      sortFields: sortFields,
      pageStrategy: "paginate",
      onChange: (state, handlers) => {
        this.setState({ loading: state.results.pending });
        if (this.solrRoot) {
          this.solrRoot.render(
            <React.Fragment>
              <SolrFacetedSearch
                {...state}
                {...handlers}
                bootstrapCss={true}
                showCsvExport={true}
                showPdfExport={true}
                onCsvExport={() => handleCsvExport(state)}
                onPdfExport={() => handlePdfExport(state)}
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
        <LinearProgress loading={this.state.loading} />
        <SEO
          title={`Search - Advanced Product Search | ${COMPANY_INFO.name}`}
          description={`Search and filter products with advanced faceting and sorting options.| ${COMPANY_INFO.seoDescription}`}
          keywords={`search, advanced search, product search, filter products, faceted search| ${COMPANY_INFO.seoKeywords}`}
          image="/images/logo.png"
          canonical="/search"
        />
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
