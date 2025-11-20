# Usage - Launcher
## Prerequisites
- Local GPG key configured (gpg --list-secret-keys)
- Controller URL and CONTROLLER_TOKEN if required

## Example
```bash
node launcher/run_job.js quick-scan 192.168.1.10
```
This will:
- create a signed manifest
- post it to the controller which will verify signature and enqueue a job
