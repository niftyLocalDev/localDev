# GMB Data Puller

A minimal Cloud Run service for manually pulling Google Business Profile and GA4 data into BigQuery.

## Architecture

```text
GitHub -> Cloud Build -> Artifact Registry -> Cloud Run
                                              |-> Google Business Profile APIs
                                              |-> Google Analytics APIs
                                              |-> Places API
                                              `-> BigQuery
```

## Repository layout

- `src/` contains the Node.js server and future application modules.
- `public/` contains the minimal browser interface.
- `references/` contains read-only Apps Script source used for translation.
- `cloudbuild.yaml` builds, stores, and deploys the container.
- `Dockerfile` defines the Cloud Run container.
- `.env.example` documents runtime configuration without secrets.

## Deployment defaults

- Artifact Registry location: `US` multi-region
- Artifact Registry repository: `gmb-data-puller`
- Cloud Run region: `us-east1`
- Cloud Run service: `gmb-data-puller`
- Runtime service account: `gmb-data-puller@PROJECT_ID.iam.gserviceaccount.com`
- BigQuery dataset: `gmb_data`

## Security

Never commit OAuth secrets, refresh tokens, API keys, service-account keys, or `.env` files. Production secrets are supplied through Google Secret Manager.

## Current status

The repository foundation and deployment configuration are present. Google OAuth, BigQuery writes, and reference puller translations have not been implemented yet.
