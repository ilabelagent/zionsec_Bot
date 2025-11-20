# Holy Siege - Safe & Auditable Recon Toolkit (Non-destructive)
This repository contains a **safe**, auditable, and authorized reconnaissance & hardening toolkit.
**It does NOT** include stealth, evasion, MITM, or exploit code.
Use only on systems you own or have explicit written permission to test.

## Quickstart (local using Docker Compose)
1. Install Docker & Docker Compose.
2. From the project root, build and run:
   ```bash
   docker compose -f docker/docker-compose.yml up --build
   ```
3. Ensure you have a GPG key and set ADMIN_KEYS env var for the controller.
4. Use the launcher to post signed manifests (see docs/USAGE.md).

## Repo layout
- controller/: Fastify controller to accept signed job manifests.
- worker/: Safe worker that runs nmap, HTTP header checks, SMTP banner checks.
- launcher/: Signed-manifest poster (one-click launcher).
- ansible/: Non-destructive hardening playbooks.
- docker/: Dockerfiles & compose for local testing.
