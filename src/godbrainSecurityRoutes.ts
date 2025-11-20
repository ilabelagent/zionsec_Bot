import { Router, Request, Response } from 'express';
import { authorizationService } from './services/authorizationService';
import { reconService } from './services/reconService';
import { webExploitService } from './services/webExploitService';
import { networkPentestService } from './services/networkPentestService';
import { cloudSecurityService } from './services/cloudSecurityService';
import { mobileSecurityService } from './services/mobileSecurityService';
import { reportingService } from './services/reportingService';

/**
 * GodBrainAI Integrated Security Platform - API Routes
 * Complete Offensive Security Suite for Authorized Engagements
 *
 * "The Lord is my rock, my fortress and my deliverer" - Psalm 18:2
 */

const router = Router();

// ============ ENGAGEMENT MANAGEMENT ============

/**
 * POST /api/security/engagements
 * Create a new penetration testing engagement
 */
router.post('/engagements', async (req: Request, res: Response) => {
  try {
    const {
      name,
      clientName,
      clientContact,
      clientEmail,
      startDate,
      endDate,
      authorizationDocPath,
      rulesOfEngagement,
      scope,
      authorizedBy,
    } = req.body;

    const engagement = authorizationService.createEngagement({
      name,
      clientName,
      clientContact,
      clientEmail,
      startDate,
      endDate,
      authorizationDocPath,
      rulesOfEngagement,
      scope,
      authorizedBy,
    });

    res.json({
      success: true,
      engagement,
      message: 'Engagement created successfully. Authorization required before activation.',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/security/engagements/:id/activate
 * Activate an engagement after verification
 */
router.post('/engagements/:id/activate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { operator } = req.body;

    const success = authorizationService.activateEngagement(id, operator);

    if (success) {
      res.json({
        success: true,
        message: 'Engagement activated. Testing may now commence.',
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Failed to activate engagement. Check authorization documents.',
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/security/engagements
 * List all engagements
 */
router.get('/engagements', async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const engagements = authorizationService.getEngagements(status as any);

    res.json({
      success: true,
      engagements,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/security/engagements/:id
 * Get specific engagement details
 */
router.get('/engagements/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const engagement = authorizationService.getEngagement(id);

    if (!engagement) {
      return res.status(404).json({
        success: false,
        error: 'Engagement not found',
      });
    }

    res.json({
      success: true,
      engagement,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/security/engagements/:id/complete
 * Complete an engagement
 */
router.post('/engagements/:id/complete', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { operator } = req.body;

    const success = authorizationService.completeEngagement(id, operator);

    res.json({
      success,
      message: success ? 'Engagement completed' : 'Failed to complete engagement',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/security/engagements/:id/emergency-stop
 * Emergency stop for an engagement
 */
router.post('/engagements/:id/emergency-stop', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { operator, reason } = req.body;

    const success = authorizationService.emergencyStop(id, operator, reason);

    res.json({
      success,
      message: success ? 'Emergency stop executed' : 'Failed to stop engagement',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/security/audit-logs
 * Get audit logs for engagements
 */
router.get('/audit-logs', async (req: Request, res: Response) => {
  try {
    const { engagementId, limit } = req.query;
    const logs = authorizationService.getAuditLogs(
      engagementId as string,
      limit ? parseInt(limit as string) : 100
    );

    res.json({
      success: true,
      logs,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============ MODULE 1: RECONNAISSANCE & OSINT ============

/**
 * POST /api/security/recon
 * Perform comprehensive reconnaissance
 */
router.post('/recon', async (req: Request, res: Response) => {
  try {
    const { target, operator, depth = 'standard' } = req.body;

    const report = await reconService.performRecon({
      target,
      operator,
      depth,
    });

    res.json({
      success: true,
      report,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============ MODULE 2: WEB EXPLOITATION ============

/**
 * POST /api/security/web-exploit/authentication
 * Test authentication mechanisms
 */
router.post('/web-exploit/authentication', async (req: Request, res: Response) => {
  try {
    const { target, operator, loginEndpoint } = req.body;

    const vulnerabilities = await webExploitService.testAuthentication({
      target,
      operator,
      loginEndpoint,
    });

    res.json({
      success: true,
      vulnerabilities,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/security/web-exploit/business-logic
 * Test business logic flaws
 */
router.post('/web-exploit/business-logic', async (req: Request, res: Response) => {
  try {
    const { target, operator, features } = req.body;

    const flaws = await webExploitService.testBusinessLogic({
      target,
      operator,
      features,
    });

    res.json({
      success: true,
      flaws,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/security/web-exploit/injections
 * Test injection vulnerabilities
 */
router.post('/web-exploit/injections', async (req: Request, res: Response) => {
  try {
    const { target, operator, endpoints } = req.body;

    const vulnerabilities = await webExploitService.testInjections({
      target,
      operator,
      endpoints,
    });

    res.json({
      success: true,
      vulnerabilities,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/security/web-exploit/file-upload
 * Test file upload vulnerabilities
 */
router.post('/web-exploit/file-upload', async (req: Request, res: Response) => {
  try {
    const { target, operator, uploadEndpoint } = req.body;

    const vulnerabilities = await webExploitService.testFileUpload({
      target,
      operator,
      uploadEndpoint,
    });

    res.json({
      success: true,
      vulnerabilities,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/security/web-exploit/full-assessment
 * Comprehensive web exploitation assessment
 */
router.post('/web-exploit/full-assessment', async (req: Request, res: Response) => {
  try {
    const { target, operator, loginEndpoint, uploadEndpoint, apiEndpoints } = req.body;

    const report = await webExploitService.performWebExploitAssessment({
      target,
      operator,
      loginEndpoint,
      uploadEndpoint,
      apiEndpoints,
    });

    res.json({
      success: true,
      report,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============ MODULE 3: NETWORK PENETRATION ============

/**
 * POST /api/security/network/port-scan
 * Perform port scan
 */
router.post('/network/port-scan', async (req: Request, res: Response) => {
  try {
    const { target, operator, portRange } = req.body;

    const results = await networkPentestService.performPortScan({
      target,
      operator,
      portRange,
    });

    res.json({
      success: true,
      results,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/security/network/active-directory
 * Test Active Directory security
 */
router.post('/network/active-directory', async (req: Request, res: Response) => {
  try {
    const { target, operator, domainController } = req.body;

    const findings = await networkPentestService.testActiveDirectory({
      target,
      operator,
      domainController,
    });

    res.json({
      success: true,
      findings,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/security/network/wireless
 * Test wireless security
 */
router.post('/network/wireless', async (req: Request, res: Response) => {
  try {
    const { target, operator, ssids } = req.body;

    const vulnerabilities = await networkPentestService.testWireless({
      target,
      operator,
      ssids,
    });

    res.json({
      success: true,
      vulnerabilities,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/security/network/vpn
 * Test VPN and remote access
 */
router.post('/network/vpn', async (req: Request, res: Response) => {
  try {
    const { target, operator, vpnEndpoint } = req.body;

    const vulnerabilities = await networkPentestService.testVPNAccess({
      target,
      operator,
      vpnEndpoint,
    });

    res.json({
      success: true,
      vulnerabilities,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/security/network/full-pentest
 * Comprehensive network penetration test
 */
router.post('/network/full-pentest', async (req: Request, res: Response) => {
  try {
    const { target, operator, includeAD, includeWireless, includeVPN } = req.body;

    const report = await networkPentestService.performNetworkPentest({
      target,
      operator,
      includeAD,
      includeWireless,
      includeVPN,
    });

    res.json({
      success: true,
      report,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============ MODULE 7: CLOUD SECURITY ============

/**
 * POST /api/security/cloud/aws-s3
 * Audit AWS S3 buckets
 */
router.post('/cloud/aws-s3', async (req: Request, res: Response) => {
  try {
    const { target, operator, bucketNames } = req.body;

    const vulnerabilities = await cloudSecurityService.auditAWSS3({
      target,
      operator,
      bucketNames,
    });

    res.json({
      success: true,
      vulnerabilities,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/security/cloud/aws-iam
 * Audit AWS IAM
 */
router.post('/cloud/aws-iam', async (req: Request, res: Response) => {
  try {
    const { target, operator } = req.body;

    const vulnerabilities = await cloudSecurityService.auditAWSIAM({
      target,
      operator,
    });

    res.json({
      success: true,
      vulnerabilities,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/security/cloud/azure
 * Audit Azure resources
 */
router.post('/cloud/azure', async (req: Request, res: Response) => {
  try {
    const { target, operator } = req.body;

    const vulnerabilities = await cloudSecurityService.auditAzure({
      target,
      operator,
    });

    res.json({
      success: true,
      vulnerabilities,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/security/cloud/gcp
 * Audit GCP resources
 */
router.post('/cloud/gcp', async (req: Request, res: Response) => {
  try {
    const { target, operator } = req.body;

    const vulnerabilities = await cloudSecurityService.auditGCP({
      target,
      operator,
    });

    res.json({
      success: true,
      vulnerabilities,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/security/cloud/full-assessment
 * Comprehensive cloud security assessment
 */
router.post('/cloud/full-assessment', async (req: Request, res: Response) => {
  try {
    const { target, operator, provider } = req.body;

    const report = await cloudSecurityService.performCloudAssessment({
      target,
      operator,
      provider,
    });

    res.json({
      success: true,
      report,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============ MODULE 6: MOBILE SECURITY ============

/**
 * POST /api/security/mobile/android
 * Test Android application
 */
router.post('/mobile/android', async (req: Request, res: Response) => {
  try {
    const { target, operator, apkPath } = req.body;

    const vulnerabilities = await mobileSecurityService.testAndroidApp({
      target,
      operator,
      apkPath,
    });

    res.json({
      success: true,
      vulnerabilities,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/security/mobile/ios
 * Test iOS application
 */
router.post('/mobile/ios', async (req: Request, res: Response) => {
  try {
    const { target, operator, ipaPath } = req.body;

    const vulnerabilities = await mobileSecurityService.testIOSApp({
      target,
      operator,
      ipaPath,
    });

    res.json({
      success: true,
      vulnerabilities,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/security/mobile/api-traffic
 * Analyze API traffic
 */
router.post('/mobile/api-traffic', async (req: Request, res: Response) => {
  try {
    const { target, operator, proxyPort } = req.body;

    const analyses = await mobileSecurityService.analyzeAPITraffic({
      target,
      operator,
      proxyPort,
    });

    res.json({
      success: true,
      analyses,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/security/mobile/full-assessment
 * Comprehensive mobile security assessment
 */
router.post('/mobile/full-assessment', async (req: Request, res: Response) => {
  try {
    const { target, operator, platform, appPath } = req.body;

    const report = await mobileSecurityService.performMobileAssessment({
      target,
      operator,
      platform,
      appPath,
    });

    res.json({
      success: true,
      report,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============ MODULE 9: REPORTING ============

/**
 * POST /api/security/reports/executive
 * Generate executive report
 */
router.post('/reports/executive', async (req: Request, res: Response) => {
  try {
    const { engagementId, allFindings } = req.body;

    const report = reportingService.generateExecutiveReport({
      engagementId,
      allFindings,
    });

    res.json({
      success: true,
      report,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/security/reports/technical
 * Generate technical report
 */
router.post('/reports/technical', async (req: Request, res: Response) => {
  try {
    const { engagementId, reconReport, webExploitReport, networkReport, cloudReport, mobileReport } = req.body;

    const report = reportingService.generateTechnicalReport({
      engagementId,
      reconReport,
      webExploitReport,
      networkReport,
      cloudReport,
      mobileReport,
    });

    res.json({
      success: true,
      report,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/security/reports/compliance
 * Generate compliance report
 */
router.post('/reports/compliance', async (req: Request, res: Response) => {
  try {
    const { engagementId, findings, frameworks } = req.body;

    const report = reportingService.generateComplianceReport({
      engagementId,
      findings,
      frameworks,
    });

    res.json({
      success: true,
      report,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/security/reports/roadmap
 * Generate remediation roadmap
 */
router.post('/reports/roadmap', async (req: Request, res: Response) => {
  try {
    const { engagementId, findings } = req.body;

    const roadmap = reportingService.generateRemediationRoadmap({
      engagementId,
      findings,
    });

    res.json({
      success: true,
      roadmap,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/security/reports/final
 * Generate comprehensive final report
 */
router.post('/reports/final', async (req: Request, res: Response) => {
  try {
    const { engagementId, reconReport, webExploitReport, networkReport, cloudReport, mobileReport } = req.body;

    const report = reportingService.generateFinalReport({
      engagementId,
      reconReport,
      webExploitReport,
      networkReport,
      cloudReport,
      mobileReport,
    });

    res.json({
      success: true,
      report,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
