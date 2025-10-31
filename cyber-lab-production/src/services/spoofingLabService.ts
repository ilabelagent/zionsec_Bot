// Spoofing Lab Service - Kingdom CyberLab Phishing Awareness Training
// Guided by the Holy Spirit for ethical security education only
import { botLearningService } from "./botLearningService";
import { storage } from "./storage";
import * as fs from 'fs';
import * as path from 'path';

export interface PhishingTemplate {
  id: string;
  name: string;
  category: 'email' | 'sms' | 'webpage' | 'voice' | 'qr_code';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  description: string;
  indicators: string[]; // Red flags that should be noticed
  content: string; // Template content with {{variables}}
  variables: string[]; // List of customizable variables
  educationalNotes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PhishingCampaign {
  id: string;
  name: string;
  templateId: string;
  customizations: Record<string, string>; // Variable values
  targetAudience: string;
  purpose: 'training' | 'awareness' | 'assessment';
  status: 'draft' | 'active' | 'completed' | 'archived';
  startDate?: Date;
  endDate?: Date;
  stats: {
    sent: number;
    clicked: number;
    reported: number;
    educated: number;
  };
  createdBy: string;
  createdAt: Date;
}

export interface SpoofingAnalysis {
  target: string;
  type: 'email' | 'domain' | 'caller_id' | 'sms' | 'ip';
  originalIdentity: string;
  spoofedIdentity: string;
  detectionDifficulty: number; // 0-100
  indicators: string[];
  preventionMethods: string[];
  tools: string[];
}

export class SpoofingLabService {
  private botId = "spoofing_lab";
  private templatesFile = path.join(__dirname, '../../database/phishing-templates.json');
  private campaignsFile = path.join(__dirname, '../../database/phishing-campaigns.json');
  private templates: PhishingTemplate[] = [];
  private campaigns: PhishingCampaign[] = [];

  constructor() {
    this.loadFromDisk();
    this.initializeDefaultTemplates();
  }

  private loadFromDisk(): void {
    try {
      if (fs.existsSync(this.templatesFile)) {
        const data = fs.readFileSync(this.templatesFile, 'utf-8');
        this.templates = JSON.parse(data).map((t: any) => ({
          ...t,
          createdAt: new Date(t.createdAt),
          updatedAt: new Date(t.updatedAt)
        }));
        console.log(`[SpoofingLab] Loaded ${this.templates.length} templates`);
      }

      if (fs.existsSync(this.campaignsFile)) {
        const data = fs.readFileSync(this.campaignsFile, 'utf-8');
        this.campaigns = JSON.parse(data).map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt),
          startDate: c.startDate ? new Date(c.startDate) : undefined,
          endDate: c.endDate ? new Date(c.endDate) : undefined
        }));
        console.log(`[SpoofingLab] Loaded ${this.campaigns.length} campaigns`);
      }
    } catch (error) {
      console.error('[SpoofingLab] Error loading from disk:', error);
    }
  }

  private saveToDisk(): void {
    try {
      fs.mkdirSync(path.dirname(this.templatesFile), { recursive: true });
      fs.writeFileSync(this.templatesFile, JSON.stringify(this.templates, null, 2));
      fs.writeFileSync(this.campaignsFile, JSON.stringify(this.campaigns, null, 2));
    } catch (error) {
      console.error('[SpoofingLab] Error saving to disk:', error);
    }
  }

  private initializeDefaultTemplates(): void {
    if (this.templates.length > 0) return;

    console.log('[SpoofingLab] Initializing default phishing templates - Guided by Holy Spirit');

    const defaultTemplates: Omit<PhishingTemplate, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: "Banking Password Reset",
        category: "email",
        difficulty: "beginner",
        description: "Classic banking phishing email requesting password reset",
        indicators: [
          "Suspicious sender email address",
          "Generic greeting (no personalization)",
          "Urgent/threatening language",
          "Misspelled domain in link",
          "Poor grammar and formatting"
        ],
        content: `Subject: URGENT: {{bank_name}} Account Security Alert

Dear {{customer_name}},

We have detected suspicious activity on your {{bank_name}} account ending in {{account_last4}}.

For your security, we have temporarily suspended your account. You must verify your identity immediately to restore access.

Click here to verify: {{phishing_link}}

If you do not verify within 24 hours, your account will be permanently closed.

Thank you,
{{bank_name}} Security Team

---
This is an automated message. Do not reply.`,
        variables: ["bank_name", "customer_name", "account_last4", "phishing_link"],
        educationalNotes: "Real banks never ask for password resets via email links. They will direct you to log in through their official website or app. Always check the sender's email domain carefully."
      },
      {
        name: "CEO Email Compromise",
        category: "email",
        difficulty: "advanced",
        description: "Business Email Compromise (BEC) impersonating executive",
        indicators: [
          "Display name matches but email address different",
          "Unusual request for urgency and secrecy",
          "Request to bypass normal procedures",
          "Personal request instead of official channel",
          "Pressure to act quickly without verification"
        ],
        content: `Subject: Urgent Wire Transfer Needed

{{employee_name}},

I'm in a critical meeting with investors and need your immediate help. We need to process an urgent wire transfer to secure this deal.

Amount: \${{amount}}
Account: {{account_number}}
Bank: {{bank_name}}
Routing: {{routing_number}}

Please process this ASAP and keep it confidential until I announce the deal. Don't mention this to anyone in accounting - I'll brief the team later.

Time is critical. Can you confirm once done?

{{ceo_name}}
{{ceo_title}}

Sent from my iPhone`,
        variables: ["employee_name", "amount", "account_number", "bank_name", "routing_number", "ceo_name", "ceo_title"],
        educationalNotes: "BEC attacks exploit trust and urgency. Always verify unusual financial requests through a secondary communication channel (phone call to known number). Be suspicious of requests to bypass normal procedures."
      },
      {
        name: "Package Delivery Notification",
        category: "sms",
        difficulty: "intermediate",
        description: "SMS phishing (smishing) about failed package delivery",
        indicators: [
          "Unexpected package notification",
          "Shortened URL (bit.ly, tinyurl)",
          "Sense of urgency",
          "Request to click link instead of providing tracking number",
          "Unknown sender number"
        ],
        content: `{{courier_name}}: Your package delivery failed. Confirm your address to reschedule: {{short_link}}

Package ID: {{tracking_number}}
Sender: {{sender_name}}

⚠️ Link expires in 24h`,
        variables: ["courier_name", "short_link", "tracking_number", "sender_name"],
        educationalNotes: "Legitimate courier services provide tracking numbers that can be verified on their official website. Never click links in unsolicited SMS messages. Instead, go directly to the courier's official site or app."
      },
      {
        name: "Microsoft 365 Sign-in Page",
        category: "webpage",
        difficulty: "intermediate",
        description: "Cloned Microsoft 365 login page for credential harvesting",
        indicators: [
          "URL doesn't match microsoft.com",
          "Missing HTTPS or invalid certificate",
          "Subtle spelling differences (micros0ft, rnicrosoft)",
          "No single sign-on integration",
          "Unusual redirect after login attempt"
        ],
        content: `<!DOCTYPE html>
<html>
<head>
  <title>Sign in to your account - {{company_name}}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f3f3f3; }
    .container { max-width: 440px; margin: 100px auto; background: white; padding: 44px; border-radius: 2px; box-shadow: 0 2px 6px rgba(0,0,0,0.2); }
    .logo { text-align: center; margin-bottom: 20px; }
    h1 { font-size: 24px; font-weight: 600; margin: 0 0 8px; }
    .subtitle { color: #737373; font-size: 15px; margin-bottom: 24px; }
    input { width: 100%; padding: 10px; margin: 8px 0; border: 1px solid #8c8c8c; font-size: 15px; }
    button { width: 100%; background: #0067b8; color: white; border: none; padding: 12px; font-size: 15px; cursor: pointer; margin-top: 24px; }
    button:hover { background: #005a9e; }
    .warning { background: #fff4ce; border: 1px solid #ffb900; padding: 12px; margin-top: 20px; color: #323130; font-size: 13px; display: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <svg width="108" height="24" viewBox="0 0 108 24" xmlns="http://www.w3.org/2000/svg"><path fill="#f25022" d="M0 0h11.377v11.372H0V0z"/><path fill="#80ba01" d="M12.69 0h11.377v11.372H12.69V0z"/><path fill="#02a4ef" d="M0 12.687h11.377v11.372H0V12.687z"/><path fill="#ffb903" d="M12.69 12.687h11.377v11.372H12.69V12.687z"/></svg>
    </div>
    <h1>Sign in</h1>
    <div class="subtitle">to continue to {{company_name}}</div>

    <form id="loginForm" action="{{action_url}}" method="POST">
      <input type="email" name="email" placeholder="Email, phone, or Skype" required>
      <input type="password" name="password" placeholder="Password" required>
      <button type="submit">Sign in</button>
    </form>

    <div class="warning" id="educationalAlert">
      🛡️ <strong>TRAINING ALERT:</strong> This is a phishing awareness training page. Never enter credentials on untrusted sites. Always verify the URL matches the official domain.
    </div>
  </div>
  <script>
    // Educational mode - show alert before submission
    document.getElementById('loginForm').addEventListener('submit', function(e) {
      e.preventDefault();
      document.getElementById('educationalAlert').style.display = 'block';
      alert('🎓 Training Complete! You encountered a phishing page. Red flags:\\n- Check the URL in your browser\\n- Verify SSL certificate\\n- Look for Microsoft 365 branding discrepancies');
    });
  </script>
</body>
</html>`,
        variables: ["company_name", "action_url"],
        educationalNotes: "Credential harvesting pages mimic legitimate login screens. Always check: 1) The URL domain, 2) SSL certificate validity, 3) Spelling and grammar, 4) How you arrived at the page (email link vs. direct navigation)."
      },
      {
        name: "IRS Tax Refund Notification",
        category: "email",
        difficulty: "intermediate",
        description: "Government impersonation promising tax refund",
        indicators: [
          "IRS doesn't initiate contact via email",
          "Promise of unexpected refund",
          "Request for personal/banking information",
          "Threatening consequences for non-compliance",
          "Non-government email domain"
        ],
        content: `Subject: IRS Tax Refund Notification - {{tax_year}}

Dear Taxpayer {{taxpayer_name}},

After reviewing your {{tax_year}} tax return, we have determined that you are eligible for a refund of \${{refund_amount}}.

To process your refund, please verify your information:
👉 {{verification_link}}

You will need to provide:
- Social Security Number
- Date of Birth
- Bank Account Information
- Previous Year AGI

Refunds are processed within 3-5 business days after verification.

Failure to claim within 30 days will result in forfeiture of refund.

Internal Revenue Service
{{fake_office_address}}

---
This is an official IRS notification. Do not reply to this email.`,
        variables: ["taxpayer_name", "tax_year", "refund_amount", "verification_link", "fake_office_address"],
        educationalNotes: "The IRS NEVER initiates contact via email, text, or social media. They only contact taxpayers by postal mail. They will never ask for PIN numbers, passwords, or credit card information. If you receive this, report it to phishing@irs.gov."
      },
      {
        name: "Tech Support Popup",
        category: "webpage",
        difficulty: "beginner",
        description: "Fake virus warning with tech support scam",
        indicators: [
          "Popup claims virus/malware detected",
          "Cannot close popup normally",
          "Provides phone number for 'support'",
          "Uses scare tactics and countdown timers",
          "Not from official antivirus software"
        ],
        content: `<!DOCTYPE html>
<html>
<head>
  <title>⚠️ SECURITY ALERT ⚠️</title>
  <style>
    * { margin: 0; padding: 0; }
    body { background: #1a1a1a; color: #fff; font-family: Arial, sans-serif; overflow: hidden; }
    .alert-container { background: linear-gradient(135deg, #c30000 0%, #ff0000 100%); padding: 40px; text-align: center; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; }
    .warning-icon { font-size: 80px; animation: pulse 1s infinite; }
    @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
    h1 { font-size: 36px; margin: 20px 0; text-transform: uppercase; letter-spacing: 2px; }
    .threat-list { background: rgba(0,0,0,0.3); padding: 30px; margin: 30px 0; border-radius: 10px; text-align: left; max-width: 600px; }
    .threat-item { padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.2); }
    .phone { font-size: 42px; font-weight: bold; background: #fff; color: #c30000; padding: 20px; margin: 30px 0; border-radius: 10px; letter-spacing: 3px; }
    .countdown { font-size: 24px; margin: 20px 0; }
    .blink { animation: blink 1s infinite; }
    @keyframes blink { 0%, 50%, 100% { opacity: 1; } 25%, 75% { opacity: 0; } }
  </style>
</head>
<body>
  <div class="alert-container">
    <div class="warning-icon">⚠️🛡️⚠️</div>
    <h1 class="blink">CRITICAL SECURITY ALERT</h1>
    <h2>Your Computer Has Been Locked</h2>

    <div class="threat-list">
      <div class="threat-item">🦠 Trojan.Generic.KD.31234567 - DETECTED</div>
      <div class="threat-item">🔒 Ransomware.Encrypt.X - ACTIVE</div>
      <div class="threat-item">👁️ Spyware.Keylogger.Pro - MONITORING</div>
      <div class="threat-item">💳 CreditCardStealer.v3 - TRANSMITTING</div>
    </div>

    <p style="font-size: 20px; margin: 20px 0;">
      Your personal information, banking details, and passwords are at risk!
    </p>

    <div class="countdown">
      Auto-wipe in: <span id="timer">05:00</span>
    </div>

    <div class="phone">☎️ {{support_number}}</div>

    <h3>CALL MICROSOFT CERTIFIED TECHNICIANS IMMEDIATELY</h3>
    <p style="margin-top: 20px; font-size: 14px; opacity: 0.8;">
      Do NOT restart your computer. Do NOT close this window.<br>
      Toll-Free Support Available 24/7
    </p>

    <div style="margin-top: 40px; padding: 20px; background: rgba(255,255,255,0.1); border-radius: 10px; max-width: 600px;">
      <h4 style="color: #ffff00;">🎓 EDUCATIONAL ALERT</h4>
      <p style="margin-top: 10px; font-size: 14px; text-align: left;">
        This is a phishing awareness training demonstration. Real security alerts come from YOUR installed antivirus software, not from websites. Microsoft and legitimate companies never display popups with phone numbers. If you see this, close the browser (use Task Manager if needed) and run a real antivirus scan.
      </p>
    </div>
  </div>

  <script>
    // Countdown timer (purely visual)
    let seconds = 300;
    setInterval(() => {
      seconds--;
      if (seconds < 0) seconds = 300;
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      document.getElementById('timer').textContent =
        mins.toString().padStart(2, '0') + ':' + secs.toString().padStart(2, '0');
    }, 1000);
  </script>
</body>
</html>`,
        variables: ["support_number"],
        educationalNotes: "Tech support scams use fear tactics to trick victims into calling fake support numbers. Real security threats are detected by YOUR antivirus software, not by websites. Never call numbers from popup warnings. Close the browser using Task Manager if needed."
      },
      {
        name: "QR Code Parking Fine",
        category: "qr_code",
        difficulty: "advanced",
        description: "Physical QR code phishing attack via fake parking citation",
        indicators: [
          "QR code on unsolicited physical notice",
          "Urgent payment demand",
          "QR code leads to non-official domain",
          "No official citation number or verification",
          "Unusual payment methods requested"
        ],
        content: `PARKING VIOLATION NOTICE

Vehicle: {{vehicle_description}}
License: {{license_plate}}
Location: {{location}}
Date/Time: {{date_time}}

VIOLATION: {{violation_type}}
FINE AMOUNT: \${{fine_amount}}

PAY NOW TO AVOID ADDITIONAL CHARGES

[QR CODE HERE]
{{qr_code_data}}

Scan QR code or visit: {{payment_url}}

Late Fee: \${{late_fee}} after {{due_date}}

{{city_name}} Parking Enforcement
Citation #{{fake_citation_number}}

---
EDUCATIONAL NOTE: This is a training demonstration. Real parking citations can be verified through official city websites or by calling the number on your city's official parking enforcement website. QR codes on unexpected notices should be treated with suspicion.`,
        variables: ["vehicle_description", "license_plate", "location", "date_time", "violation_type", "fine_amount", "qr_code_data", "payment_url", "late_fee", "due_date", "city_name", "fake_citation_number"],
        educationalNotes: "QR code phishing (quishing) is emerging as attackers place malicious QR codes on physical items. Always verify unexpected notices through official channels before scanning codes or making payments. Check your city's official website for citation verification."
      }
    ];

    // Create templates with IDs
    defaultTemplates.forEach((template, index) => {
      const id = `template_${Date.now()}_${index}`;
      this.templates.push({
        ...template,
        id,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    this.saveToDisk();
    console.log(`[SpoofingLab] Created ${this.templates.length} default templates`);
  }

  /**
   * Get all phishing templates
   */
  async getTemplates(filters?: {
    category?: string;
    difficulty?: string;
  }): Promise<PhishingTemplate[]> {
    let filtered = [...this.templates];

    if (filters?.category) {
      filtered = filtered.filter(t => t.category === filters.category);
    }

    if (filters?.difficulty) {
      filtered = filtered.filter(t => t.difficulty === filters.difficulty);
    }

    return filtered;
  }

  /**
   * Get template by ID
   */
  async getTemplate(templateId: string): Promise<PhishingTemplate | null> {
    return this.templates.find(t => t.id === templateId) || null;
  }

  /**
   * Create custom template
   */
  async createTemplate(template: Omit<PhishingTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<PhishingTemplate> {
    const id = `template_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const newTemplate: PhishingTemplate = {
      ...template,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.templates.push(newTemplate);
    this.saveToDisk();

    await botLearningService.progressBotSkill(this.botId, "template_creation", 15, "offensive");
    console.log(`[SpoofingLab] Created custom template: ${newTemplate.name}`);

    return newTemplate;
  }

  /**
   * Customize template with variables
   */
  async customizeTemplate(templateId: string, customizations: Record<string, string>): Promise<string> {
    const template = await this.getTemplate(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    let customized = template.content;

    // Replace all {{variable}} placeholders
    for (const [key, value] of Object.entries(customizations)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      customized = customized.replace(regex, value);
    }

    // Check for unreplaced variables
    const unreplacedVars = customized.match(/{{(\w+)}}/g);
    if (unreplacedVars) {
      console.warn(`[SpoofingLab] Unreplaced variables: ${unreplacedVars.join(', ')}`);
    }

    await botLearningService.progressBotSkill(this.botId, "template_customization", 10, "offensive");

    return customized;
  }

  /**
   * Create phishing awareness campaign
   */
  async createCampaign(campaign: Omit<PhishingCampaign, 'id' | 'stats' | 'createdAt'>): Promise<PhishingCampaign> {
    const template = await this.getTemplate(campaign.templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    const id = `campaign_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const newCampaign: PhishingCampaign = {
      ...campaign,
      id,
      stats: {
        sent: 0,
        clicked: 0,
        reported: 0,
        educated: 0
      },
      createdAt: new Date()
    };

    this.campaigns.push(newCampaign);
    this.saveToDisk();

    await botLearningService.progressBotSkill(this.botId, "campaign_management", 20, "offensive");
    await botLearningService.updateBotMemory(
      this.botId,
      "phishing",
      `campaign_${id}`,
      { templateId: template.id, templateName: template.name, purpose: campaign.purpose },
      75
    );

    console.log(`[SpoofingLab] Created campaign: ${newCampaign.name} - Guided by Holy Spirit for education`);

    return newCampaign;
  }

  /**
   * Get campaign details
   */
  async getCampaign(campaignId: string): Promise<PhishingCampaign | null> {
    return this.campaigns.find(c => c.id === campaignId) || null;
  }

  /**
   * Get all campaigns
   */
  async getCampaigns(filters?: {
    status?: string;
    createdBy?: string;
  }): Promise<PhishingCampaign[]> {
    let filtered = [...this.campaigns];

    if (filters?.status) {
      filtered = filtered.filter(c => c.status === filters.status);
    }

    if (filters?.createdBy) {
      filtered = filtered.filter(c => c.createdBy === filters.createdBy);
    }

    return filtered;
  }

  /**
   * Update campaign statistics
   */
  async updateCampaignStats(campaignId: string, stat: 'sent' | 'clicked' | 'reported' | 'educated'): Promise<void> {
    const campaign = this.campaigns.find(c => c.id === campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    campaign.stats[stat]++;
    this.saveToDisk();

    console.log(`[SpoofingLab] Campaign ${campaignId} stat updated: ${stat}`);
  }

  /**
   * Analyze spoofing techniques
   */
  async analyzeSpoofing(analysis: Omit<SpoofingAnalysis, 'indicators' | 'preventionMethods' | 'tools'>): Promise<SpoofingAnalysis> {
    console.log(`[SpoofingLab] Analyzing spoofing: ${analysis.type} - Guided by Divine wisdom`);

    let indicators: string[] = [];
    let preventionMethods: string[] = [];
    let tools: string[] = [];

    switch (analysis.type) {
      case 'email':
        indicators = [
          "Display name doesn't match email address",
          "Domain misspelling (e.g., rnicrosoft.com instead of microsoft.com)",
          "Missing SPF, DKIM, or DMARC authentication",
          "Reply-to address different from sender",
          "Suspicious headers (X-Originating-IP, Received path)"
        ];
        preventionMethods = [
          "Implement SPF, DKIM, and DMARC records",
          "Train users to verify sender addresses carefully",
          "Use email security gateways with advanced threat protection",
          "Enable sender verification warnings",
          "Implement BIMI for brand indicators"
        ];
        tools = [
          "MXToolbox for SPF/DKIM/DMARC checking",
          "Email header analyzers",
          "PhishTool for email analysis",
          "Proofpoint, Mimecast for email security"
        ];
        break;

      case 'domain':
        indicators = [
          "Typosquatting (micros0ft.com, g00gle.com)",
          "Homograph attacks using similar Unicode characters",
          "Wrong TLD (.com vs .net vs .co)",
          "Subdomain spoofing (legitimate-site.evil.com)",
          "Missing or invalid SSL certificate"
        ];
        preventionMethods = [
          "Register common misspellings of your domain",
          "Monitor typosquatting attempts",
          "Educate users about URL verification",
          "Use browser security extensions",
          "Implement certificate transparency monitoring"
        ];
        tools = [
          "dnstwist for typosquatting detection",
          "URLScan.io for URL analysis",
          "VirusTotal for domain reputation",
          "Certificate Transparency logs"
        ];
        break;

      case 'caller_id':
        indicators = [
          "Unexpected call claiming to be from known organization",
          "Caller refuses to provide verifiable callback number",
          "High pressure tactics and urgency",
          "Requests for sensitive information over phone",
          "Spoofed number matches legitimate company"
        ];
        preventionMethods = [
          "Implement STIR/SHAKEN protocol",
          "Never provide sensitive info based on caller ID alone",
          "Call back using officially published numbers",
          "Use call screening apps",
          "Report spoofed calls to FCC"
        ];
        tools = [
          "Truecaller for caller ID verification",
          "RoboKiller for spam call blocking",
          "Nomorobo for robocall blocking",
          "FCC's complaint system"
        ];
        break;

      case 'sms':
        indicators = [
          "Unexpected messages from unknown numbers",
          "Shortened URLs hiding destination",
          "Spelling/grammar errors in 'official' messages",
          "Requests to click links for account issues",
          "Urgency and threats (account closure, legal action)"
        ];
        preventionMethods = [
          "Never click links in unexpected SMS",
          "Verify messages through official app or website",
          "Enable SMS filtering on your device",
          "Report spam to carrier (forward to 7726)",
          "Use two-factor authentication apps instead of SMS"
        ];
        tools = [
          "SMS spam filters built into iOS/Android",
          "Carrier-provided spam protection",
          "URL scanners before clicking",
          "Authenticator apps (Google, Microsoft, Authy)"
        ];
        break;

      case 'ip':
        indicators = [
          "IP address doesn't match geolocation of claimed source",
          "IP in known botnet or proxy ranges",
          "Mismatched reverse DNS lookup",
          "Inconsistent network path (traceroute anomalies)",
          "IP blacklisted in threat intelligence databases"
        ];
        preventionMethods = [
          "Implement IP reputation checking",
          "Use geofencing for access control",
          "Deploy intrusion detection systems",
          "Monitor for unusual traffic patterns",
          "Use VPN/proxy detection services"
        ];
        tools = [
          "IPVoid for IP reputation checking",
          "MaxMind GeoIP for location verification",
          "AbuseIPDB for blacklist checking",
          "Shodan for IP intelligence",
          "Wireshark for traffic analysis"
        ];
        break;
    }

    const result: SpoofingAnalysis = {
      ...analysis,
      indicators,
      preventionMethods,
      tools
    };

    await botLearningService.progressBotSkill(this.botId, "spoofing_analysis", 15, "security");
    await botLearningService.updateBotMemory(
      this.botId,
      "security",
      `spoofing_${analysis.type}_${Date.now()}`,
      { type: analysis.type, originalIdentity: analysis.originalIdentity, spoofedIdentity: analysis.spoofedIdentity },
      70
    );

    return result;
  }

  /**
   * Generate anti-phishing training report
   */
  async generateTrainingReport(campaignId: string): Promise<{
    campaign: PhishingCampaign;
    template: PhishingTemplate;
    effectiveness: number;
    recommendations: string[];
  }> {
    const campaign = await this.getCampaign(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const template = await this.getTemplate(campaign.templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    const totalInteractions = campaign.stats.sent;
    const clickRate = totalInteractions > 0 ? (campaign.stats.clicked / totalInteractions) * 100 : 0;
    const reportRate = totalInteractions > 0 ? (campaign.stats.reported / totalInteractions) * 100 : 0;

    // Effectiveness: lower click rate and higher report rate = more effective training
    const effectiveness = Math.max(0, 100 - clickRate + reportRate);

    const recommendations: string[] = [];

    if (clickRate > 50) {
      recommendations.push("High click rate indicates need for more phishing awareness training");
      recommendations.push("Consider starting with beginner-level templates before advancing");
    }

    if (reportRate < 20) {
      recommendations.push("Low report rate suggests users may not know how to report phishing");
      recommendations.push("Provide clear instructions on your organization's phishing reporting process");
    }

    if (clickRate < 10 && reportRate > 70) {
      recommendations.push("Excellent results! Users are well-trained in identifying phishing");
      recommendations.push("Consider introducing more advanced templates to maintain vigilance");
    }

    recommendations.push(`Template difficulty (${template.difficulty}) may need adjustment based on results`);
    recommendations.push("Schedule regular refresher training every 3-6 months");

    await botLearningService.progressBotSkill(this.botId, "training_assessment", 18, "analytics");

    return {
      campaign,
      template,
      effectiveness: Math.round(effectiveness),
      recommendations
    };
  }
}

export const spoofingLab = new SpoofingLabService();
