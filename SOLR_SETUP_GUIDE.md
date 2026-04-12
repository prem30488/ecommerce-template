# Apache Solr Setup Guide

**Status:** Required for Advanced Search Features

Apache Solr is used for the "Advanced Search" page, providing high-performance faceted search, filtering, and text matching.

---

## ✅ Quick Setup (Docker)

**Prerequisite:** Docker Desktop installed

### 1. Start Solr with the 'hanley' core
Run the following command in your terminal to start a Solr container and create the required core:

```bash
# Start container
docker run -d -p 8983:8983 --name solr-hanley solr:latest

# Wait a few seconds for initialization, then create the core
docker exec solr-hanley solr create -c hanley
```

### 2. Index Data into Solr
The application needs to populate Solr with product data from the database. A seeding script is provided:

```bash
cd backend
node seedSolr.js
```

### 3. Verify it's running
Visit the Solr Admin UI: [http://localhost:8983/solr/](http://localhost:8983/solr/)
Or check the selection endpoint: [http://localhost:8983/solr/hanley/select?q=*:*](http://localhost:8983/solr/hanley/select?q=*:*)

---

## 🔧 Managing Solr

**Stop Solr:**
```bash
docker stop solr-hanley
```

**Start Solr (after stopping):**
```bash
docker start solr-hanley
```

**Full Reset (Remove core and data):**
```bash
docker stop solr-hanley
docker rm solr-hanley
# Then repeat Step 1 & 2
```

---

## 🚀 Advanced Search Integration

The frontend and backend use the `SOLR_URL` environment variable (defined in `.env`) to connect to Solr. 
By default, it is set to `http://localhost:8983`.
You can access the search page at: `http://localhost:5173/advancedSearch` (assuming standard Vite port).

### Search Fields
The following fields are indexed and available for filtering:
- **Title**: Text search
- **Categories**: Faceted filtering
- **Audience**: Faceted filtering
- **Price**: Range filtering
- **Bestseller/Featured**: Boolean filtering

---

## 🐛 Troubleshooting

### Error: "Connection Refused"
- Ensure the Docker container `solr-hanley` is running (`docker ps`).
- Check if port 8983 is occupied by another process.

### Error: "Core hanley not found"
- Run the create command again: `docker exec solr-hanley solr create -c hanley`

### Search returns no results
- Sync your database data to Solr: `node backend/seedSolr.js`
