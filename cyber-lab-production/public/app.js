// Tab switching
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.add('active');
    event.target.classList.add('active');
}

// Helper function to display results
function displayResult(elementId, data, isError = false) {
    const element = document.getElementById(elementId);
    if (isError) {
        element.innerHTML = `<p class="error">Error: ${data}</p>`;
    } else {
        element.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    }
}

function showLoading(elementId) {
    const element = document.getElementById(elementId);
    element.innerHTML = '<div class="loading"></div> Processing...';
}

// ===== CYBERLAB FUNCTIONS =====

async function scanContract() {
    const contractAddress = document.getElementById('contract-address').value;
    const network = document.getElementById('contract-network').value;

    if (!contractAddress || !network) {
        alert('Please enter both contract address and network');
        return;
    }

    showLoading('contract-result');

    try {
        const response = await fetch('/api/cyberlab/scan-contract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contractAddress, network })
        });

        const data = await response.json();

        let html = `<h3>Risk Score: ${data.riskScore}/100</h3>`;

        if (data.vulnerabilities.length > 0) {
            html += '<h4>Vulnerabilities Found:</h4>';
            data.vulnerabilities.forEach(vuln => {
                html += `
                    <div style="margin: 10px 0; padding: 10px; background: #fee2e2; border-radius: 5px;">
                        <strong class="risk-${vuln.severity}">${vuln.severity.toUpperCase()}</strong>: ${vuln.type}<br>
                        <small>${vuln.description}</small><br>
                        <strong>Fix:</strong> ${vuln.recommendation}
                    </div>
                `;
            });
        } else {
            html += '<p class="success">No vulnerabilities detected!</p>';
        }

        if (data.recommendations.length > 0) {
            html += '<h4>Recommendations:</h4><ul>';
            data.recommendations.forEach(rec => {
                html += `<li>${rec}</li>`;
            });
            html += '</ul>';
        }

        document.getElementById('contract-result').innerHTML = html;
    } catch (error) {
        displayResult('contract-result', error.message, true);
    }
}

async function penetrationTest() {
    const targetUrl = document.getElementById('pentest-url').value;

    if (!targetUrl) {
        alert('Please enter a target URL');
        return;
    }

    showLoading('pentest-result');

    try {
        const response = await fetch('/api/cyberlab/penetration-test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ targetUrl })
        });

        const data = await response.json();

        let html = `<h3>Severity: <span class="risk-${data.severity}">${data.severity.toUpperCase()}</span></h3>`;
        html += `<p>Exploitable: ${data.exploitable ? '<span class="error">YES</span>' : '<span class="success">NO</span>'}</p>`;

        if (data.findings.length > 0) {
            html += '<h4>Findings:</h4>';
            data.findings.forEach(finding => {
                html += `
                    <div style="margin: 10px 0; padding: 10px; background: #fef3c7; border-radius: 5px;">
                        <strong>${finding.vulnerability}</strong> - ${finding.severity}<br>
                        <small>${finding.description}</small>
                    </div>
                `;
            });
        } else {
            html += '<p class="success">No vulnerabilities found!</p>';
        }

        document.getElementById('pentest-result').innerHTML = html;
    } catch (error) {
        displayResult('pentest-result', error.message, true);
    }
}

async function simulateAttack() {
    const attackType = document.getElementById('attack-type').value;
    const target = document.getElementById('attack-target').value;

    if (!attackType || !target) {
        alert('Please enter both attack type and target');
        return;
    }

    showLoading('attack-result');

    try {
        const response = await fetch('/api/cyberlab/simulate-attack', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ attackType, target })
        });

        const data = await response.json();

        let html = `<h3>Attack: ${data.method}</h3>`;
        html += `<p>Success: ${data.success ? '<span class="warning">YES</span>' : '<span class="success">NO</span>'}</p>`;

        if (data.mitigation.length > 0) {
            html += '<h4>Mitigation Strategies:</h4><ul>';
            data.mitigation.forEach(mit => {
                html += `<li>${mit}</li>`;
            });
            html += '</ul>';
        }

        document.getElementById('attack-result').innerHTML = html;
    } catch (error) {
        displayResult('attack-result', error.message, true);
    }
}

async function auditWallet() {
    const walletAddress = document.getElementById('wallet-address').value;

    if (!walletAddress) {
        alert('Please enter a wallet address');
        return;
    }

    showLoading('wallet-result');

    try {
        const response = await fetch('/api/cyberlab/audit-wallet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ walletAddress })
        });

        const data = await response.json();

        let html = `<h3>Security Score: ${data.securityScore}/100</h3>`;

        if (data.risks.length > 0) {
            html += '<h4>Risks Identified:</h4><ul>';
            data.risks.forEach(risk => {
                html += `<li class="warning">${risk}</li>`;
            });
            html += '</ul>';
        }

        if (data.recommendations.length > 0) {
            html += '<h4>Recommendations:</h4><ul>';
            data.recommendations.forEach(rec => {
                html += `<li>${rec}</li>`;
            });
            html += '</ul>';
        }

        document.getElementById('wallet-result').innerHTML = html;
    } catch (error) {
        displayResult('wallet-result', error.message, true);
    }
}

async function detectPhishing() {
    const url = document.getElementById('phishing-url').value;

    if (!url) {
        alert('Please enter a URL');
        return;
    }

    showLoading('phishing-result');

    try {
        const response = await fetch('/api/cyberlab/detect-phishing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });

        const data = await response.json();

        let html = `<h3>Phishing: ${data.isPhishing ? '<span class="error">YES</span>' : '<span class="success">NO</span>'}</h3>`;
        html += `<p>Confidence: ${data.confidence}%</p>`;

        if (data.indicators.length > 0) {
            html += '<h4>Indicators:</h4><ul>';
            data.indicators.forEach(ind => {
                html += `<li class="warning">${ind}</li>`;
            });
            html += '</ul>';
        }

        document.getElementById('phishing-result').innerHTML = html;
    } catch (error) {
        displayResult('phishing-result', error.message, true);
    }
}

// ===== BANKING FUNCTIONS =====

async function linkAccount() {
    const userId = document.getElementById('user-id').value;
    const plaidToken = document.getElementById('plaid-token').value;

    if (!userId || !plaidToken) {
        alert('Please enter both user ID and Plaid token');
        return;
    }

    showLoading('link-result');

    try {
        const response = await fetch('/api/banking/link-account', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, plaidToken })
        });

        const data = await response.json();
        document.getElementById('link-result').innerHTML =
            `<p class="success">Account linked successfully!</p><p>Account ID: <strong>${data.accountId}</strong></p>`;
    } catch (error) {
        displayResult('link-result', error.message, true);
    }
}

async function getBalance() {
    const accountId = document.getElementById('balance-account').value;

    if (!accountId) {
        alert('Please enter an account ID');
        return;
    }

    showLoading('balance-result');

    try {
        const response = await fetch(`/api/banking/balance/${accountId}`);
        const data = await response.json();

        let html = `
            <h3>Account Balance</h3>
            <p>Available: <strong>$${data.available.toFixed(2)}</strong></p>
            <p>Current: <strong>$${data.current.toFixed(2)}</strong></p>
        `;

        if (data.limit) {
            html += `<p>Limit: <strong>$${data.limit.toFixed(2)}</strong></p>`;
        }

        document.getElementById('balance-result').innerHTML = html;
    } catch (error) {
        displayResult('balance-result', error.message, true);
    }
}

async function initiateACH() {
    const accountId = document.getElementById('ach-account').value;
    const amount = parseFloat(document.getElementById('ach-amount').value);
    const direction = document.getElementById('ach-direction').value;

    if (!accountId || !amount) {
        alert('Please enter both account ID and amount');
        return;
    }

    showLoading('ach-result');

    try {
        const response = await fetch('/api/banking/ach', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accountId, amount, direction })
        });

        const data = await response.json();
        document.getElementById('ach-result').innerHTML =
            `<p class="success">ACH ${direction} initiated!</p><p>ACH ID: <strong>${data.achId}</strong></p><p>Amount: $${amount.toFixed(2)}</p>`;
    } catch (error) {
        displayResult('ach-result', error.message, true);
    }
}

async function getTransactions() {
    const accountId = document.getElementById('trans-account').value;
    const days = parseInt(document.getElementById('trans-days').value) || 30;

    if (!accountId) {
        alert('Please enter an account ID');
        return;
    }

    showLoading('trans-result');

    try {
        const response = await fetch(`/api/banking/transactions/${accountId}?days=${days}`);
        const data = await response.json();

        let html = `<h3>Last ${days} Days - ${data.length} Transactions</h3>`;

        data.forEach(tx => {
            const color = tx.amount >= 0 ? '#10b981' : '#ef4444';
            html += `
                <div style="margin: 10px 0; padding: 10px; background: #f9fafb; border-radius: 5px; border-left: 4px solid ${color};">
                    <strong>${tx.description}</strong><br>
                    <small>${new Date(tx.date).toLocaleDateString()} - ${tx.category}</small><br>
                    <strong style="color: ${color};">${tx.amount >= 0 ? '+' : ''}$${tx.amount.toFixed(2)}</strong>
                </div>
            `;
        });

        document.getElementById('trans-result').innerHTML = html;
    } catch (error) {
        displayResult('trans-result', error.message, true);
    }
}

async function categorizeTransactions() {
    const accountId = document.getElementById('cat-account').value;

    if (!accountId) {
        alert('Please enter an account ID');
        return;
    }

    showLoading('cat-result');

    try {
        const response = await fetch(`/api/banking/categorize/${accountId}`);
        const data = await response.json();

        let html = '<h3>Spending by Category</h3>';

        if (data.categories.length > 0) {
            const total = data.categories.reduce((sum, cat) => sum + cat.amount, 0);

            data.categories.forEach(cat => {
                const percentage = (cat.amount / total * 100).toFixed(1);
                html += `
                    <div style="margin: 10px 0;">
                        <strong>${cat.name}</strong>: $${cat.amount.toFixed(2)} (${percentage}%)
                        <div class="skill-bar">
                            <div class="skill-progress" style="width: ${percentage}%">${percentage}%</div>
                        </div>
                    </div>
                `;
            });
        } else {
            html += '<p>No spending data available</p>';
        }

        document.getElementById('cat-result').innerHTML = html;
    } catch (error) {
        displayResult('cat-result', error.message, true);
    }
}

async function getCreditScore() {
    const userId = document.getElementById('credit-user').value;

    if (!userId) {
        alert('Please enter a user ID');
        return;
    }

    showLoading('credit-result');

    try {
        const response = await fetch(`/api/banking/credit-score/${userId}`);
        const data = await response.json();

        let rating, color;
        if (data.score >= 750) {
            rating = 'Excellent';
            color = '#10b981';
        } else if (data.score >= 700) {
            rating = 'Good';
            color = '#3b82f6';
        } else if (data.score >= 650) {
            rating = 'Fair';
            color = '#f59e0b';
        } else {
            rating = 'Poor';
            color = '#ef4444';
        }

        document.getElementById('credit-result').innerHTML = `
            <h3 style="color: ${color}">Credit Score: ${data.score}</h3>
            <p>Rating: <strong style="color: ${color}">${rating}</strong></p>
        `;
    } catch (error) {
        displayResult('credit-result', error.message, true);
    }
}

async function analyzeLoan() {
    const userId = document.getElementById('loan-user').value;
    const loanAmount = parseFloat(document.getElementById('loan-amount').value);

    if (!userId || !loanAmount) {
        alert('Please enter both user ID and loan amount');
        return;
    }

    showLoading('loan-result');

    try {
        const response = await fetch('/api/banking/loan-qualification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, loanAmount })
        });

        const data = await response.json();

        let html = `<h3>Loan Qualification: ${data.qualified ? '<span class="success">QUALIFIED</span>' : '<span class="error">NOT QUALIFIED</span>'}</h3>`;
        html += `<p>Max Loan: <strong>$${data.maxLoan.toFixed(2)}</strong></p>`;
        html += `<p>Interest Rate: <strong>${data.interestRate.toFixed(2)}%</strong></p>`;
        html += `<p>Monthly Payment: <strong>$${data.monthlyPayment.toFixed(2)}</strong></p>`;

        if (data.recommendations.length > 0) {
            html += '<h4>Recommendations:</h4><ul>';
            data.recommendations.forEach(rec => {
                html += `<li>${rec}</li>`;
            });
            html += '</ul>';
        }

        document.getElementById('loan-result').innerHTML = html;
    } catch (error) {
        displayResult('loan-result', error.message, true);
    }
}

async function getFinancialHealth() {
    const userId = document.getElementById('health-user').value;

    if (!userId) {
        alert('Please enter a user ID');
        return;
    }

    showLoading('health-result');

    try {
        const response = await fetch(`/api/banking/financial-health/${userId}`);
        const data = await response.json();

        let gradeColor;
        switch(data.grade) {
            case 'A': gradeColor = '#10b981'; break;
            case 'B': gradeColor = '#3b82f6'; break;
            case 'C': gradeColor = '#f59e0b'; break;
            default: gradeColor = '#ef4444';
        }

        let html = `<h3>Financial Health Score: ${data.score}/100</h3>`;
        html += `<h2 style="color: ${gradeColor}">Grade: ${data.grade}</h2>`;

        if (data.factors.length > 0) {
            html += '<h4>Factors:</h4>';
            data.factors.forEach(factor => {
                html += `
                    <div style="margin: 10px 0; padding: 10px; background: #f9fafb; border-radius: 5px;">
                        <strong>${factor.name}</strong>: ${factor.score} points<br>
                        <small>Status: ${factor.status}</small>
                    </div>
                `;
            });
        }

        if (data.recommendations.length > 0) {
            html += '<h4>Recommendations:</h4><ul>';
            data.recommendations.forEach(rec => {
                html += `<li>${rec}</li>`;
            });
            html += '</ul>';
        }

        document.getElementById('health-result').innerHTML = html;
    } catch (error) {
        displayResult('health-result', error.message, true);
    }
}

// ===== LEARNING FUNCTIONS =====

async function getSkills() {
    const botId = document.getElementById('skills-bot').value;
    showLoading('skills-result');

    try {
        const url = botId ? `/api/learning/skills?botId=${botId}` : '/api/learning/skills';
        const response = await fetch(url);
        const data = await response.json();

        if (data.length === 0) {
            document.getElementById('skills-result').innerHTML = '<p>No skills learned yet. Try using some features!</p>';
            return;
        }

        let html = '<h3>Bot Skills</h3>';
        data.forEach(skill => {
            const progress = (skill.experience % 100);
            html += `
                <div class="skill-item">
                    <strong>${skill.skillName}</strong> (${skill.category})<br>
                    <small>Bot: ${skill.botId}</small><br>
                    Level ${skill.level} - ${skill.experience} XP
                    <div class="skill-bar">
                        <div class="skill-progress" style="width: ${progress}%">${progress}%</div>
                    </div>
                </div>
            `;
        });

        document.getElementById('skills-result').innerHTML = html;
    } catch (error) {
        displayResult('skills-result', error.message, true);
    }
}

async function getExecutions() {
    const botId = document.getElementById('exec-bot').value;
    showLoading('exec-result');

    try {
        const url = botId ? `/api/learning/executions?botId=${botId}` : '/api/learning/executions';
        const response = await fetch(url);
        const data = await response.json();

        if (data.length === 0) {
            document.getElementById('exec-result').innerHTML = '<p>No execution history yet.</p>';
            return;
        }

        let html = `<h3>Execution History (${data.length} total)</h3>`;
        data.slice(-20).reverse().forEach(exec => {
            html += `
                <div class="exec-item">
                    <strong>${exec.action}</strong> - ${exec.success ? '<span class="success">SUCCESS</span>' : '<span class="error">FAILED</span>'}<br>
                    <small>Bot: ${exec.botId} | Reward: ${exec.reward} | ${new Date(exec.timestamp).toLocaleString()}</small>
                </div>
            `;
        });

        document.getElementById('exec-result').innerHTML = html;
    } catch (error) {
        displayResult('exec-result', error.message, true);
    }
}

async function getMemories() {
    const botId = document.getElementById('mem-bot').value;
    showLoading('mem-result');

    try {
        const url = botId ? `/api/learning/memories?botId=${botId}` : '/api/learning/memories';
        const response = await fetch(url);
        const data = await response.json();

        if (data.length === 0) {
            document.getElementById('mem-result').innerHTML = '<p>No memories stored yet.</p>';
            return;
        }

        let html = `<h3>Bot Memories (${data.length} total)</h3>`;
        data.slice(-20).reverse().forEach(mem => {
            html += `
                <div class="memory-item">
                    <strong>${mem.memoryKey}</strong> (${mem.memoryType})<br>
                    <small>Bot: ${mem.botId} | Importance: ${mem.importance} | ${new Date(mem.timestamp).toLocaleString()}</small><br>
                    <pre style="margin-top: 5px; font-size: 0.85em;">${JSON.stringify(mem.memoryValue, null, 2)}</pre>
                </div>
            `;
        });

        document.getElementById('mem-result').innerHTML = html;
    } catch (error) {
        displayResult('mem-result', error.message, true);
    }
}

// ===== ATTACK MONITOR FUNCTIONS =====

async function loadAttackStats() {
    showLoading('stats-result');

    try {
        const response = await fetch('/api/attacks/statistics');
        const data = await response.json();

        let html = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; text-align: center;">
                    <h1 style="margin: 0; font-size: 3em;">${data.totalAttacks}</h1>
                    <p style="margin: 5px 0;">Total Attacks</p>
                </div>
                <div style="background: #ef4444; color: white; padding: 20px; border-radius: 10px; text-align: center;">
                    <h1 style="margin: 0; font-size: 3em;">${data.severityCounts.critical}</h1>
                    <p style="margin: 5px 0;">Critical</p>
                </div>
                <div style="background: #f59e0b; color: white; padding: 20px; border-radius: 10px; text-align: center;">
                    <h1 style="margin: 0; font-size: 3em;">${data.severityCounts.high}</h1>
                    <p style="margin: 5px 0;">High</p>
                </div>
                <div style="background: #10b981; color: white; padding: 20px; border-radius: 10px; text-align: center;">
                    <h1 style="margin: 0; font-size: 3em;">${data.statusCounts.mitigated}</h1>
                    <p style="margin: 5px 0;">Mitigated</p>
                </div>
            </div>
            <div style="margin-top: 20px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                <div>📈 Last 24h: <strong>${data.attacks24h}</strong></div>
                <div>📅 Last 7d: <strong>${data.attacks7d}</strong></div>
                <div>🔍 Vulnerabilities: <strong>${data.totalVulnerabilities}</strong></div>
                <div>⚠️ Active Threats: <strong>${data.activeThreats}</strong></div>
                <div>📊 Avg Risk Score: <strong>${data.averageRiskScore.toFixed(1)}/100</strong></div>
                <div>🛡️ Blocked: <strong>${data.statusCounts.blocked}</strong></div>
            </div>
        `;

        document.getElementById('stats-result').innerHTML = html;
    } catch (error) {
        displayResult('stats-result', error.message, true);
    }
}

async function loadAttackLogs() {
    const severity = document.getElementById('attack-severity-filter').value;
    const status = document.getElementById('attack-status-filter').value;
    showLoading('attack-logs-result');

    try {
        let url = '/api/attacks/logs?limit=50';
        if (severity) url += `&severity=${severity}`;
        if (status) url += `&status=${status}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.length === 0) {
            document.getElementById('attack-logs-result').innerHTML = '<p>No attack logs found.</p>';
            return;
        }

        let html = `<h3>Attack Logs (${data.length} total)</h3>`;
        data.forEach(log => {
            const severityColor = {
                critical: '#ef4444',
                high: '#f59e0b',
                medium: '#3b82f6',
                low: '#10b981'
            }[log.severity];

            html += `
                <div style="margin: 15px 0; padding: 15px; background: white; border-left: 5px solid ${severityColor}; border-radius: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div>
                            <h4 style="margin: 0; color: ${severityColor};">${log.attackType} Attack</h4>
                            <p style="margin: 5px 0;"><strong>Target:</strong> ${log.target}</p>
                            <p style="margin: 5px 0; font-size: 0.9em; color: #666;">${new Date(log.timestamp).toLocaleString()}</p>
                        </div>
                        <div style="text-align: right;">
                            <span class="risk-${log.severity}" style="display: inline-block; margin-bottom: 5px;">${log.severity.toUpperCase()}</span><br>
                            <span style="background: #e5e7eb; padding: 3px 8px; border-radius: 5px; font-size: 0.85em;">${log.status}</span>
                        </div>
                    </div>
                    ${log.details.method ? `<p style="margin: 10px 0 5px 0; font-style: italic;">${log.details.method}</p>` : ''}
                    ${log.details.mitigationApplied ? `
                        <details style="margin-top: 10px;">
                            <summary style="cursor: pointer; font-weight: bold;">Mitigation Applied</summary>
                            <ul style="margin: 5px 0;">
                                ${log.details.mitigationApplied.map(m => `<li>${m}</li>`).join('')}
                            </ul>
                        </details>
                    ` : ''}
                    <p style="margin: 5px 0; font-size: 0.85em;"><strong>Detection:</strong> ${log.metadata.detectionEngine} (${log.metadata.confidence}% confidence)</p>
                </div>
            `;
        });

        document.getElementById('attack-logs-result').innerHTML = html;
    } catch (error) {
        displayResult('attack-logs-result', error.message, true);
    }
}

async function loadVulnerabilities() {
    const targetType = document.getElementById('vuln-type-filter').value;
    showLoading('vuln-result');

    try {
        let url = '/api/attacks/vulnerabilities?limit=50';
        if (targetType) url += `&targetType=${targetType}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.length === 0) {
            document.getElementById('vuln-result').innerHTML = '<p>No vulnerability reports found.</p>';
            return;
        }

        let html = `<h3>Vulnerability Reports (${data.length} total)</h3>`;
        data.forEach(report => {
            const riskColor = report.riskScore >= 70 ? '#ef4444' : report.riskScore >= 40 ? '#f59e0b' : '#10b981';

            html += `
                <div style="margin: 15px 0; padding: 15px; background: white; border-left: 5px solid ${riskColor}; border-radius: 8px;">
                    <div style="display: flex; justify-content: space-between;">
                        <div>
                            <h4 style="margin: 0;">${report.targetType.toUpperCase()}: ${report.target}</h4>
                            <p style="margin: 5px 0; font-size: 0.9em; color: #666;">${new Date(report.timestamp).toLocaleString()}</p>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 2em; font-weight: bold; color: ${riskColor};">${report.riskScore}</div>
                            <div style="font-size: 0.85em;">Risk Score</div>
                        </div>
                    </div>
                    ${report.vulnerabilities.length > 0 ? `
                        <h5 style="margin: 15px 0 10px 0;">Vulnerabilities Found:</h5>
                        ${report.vulnerabilities.map(v => `
                            <div style="margin: 10px 0; padding: 10px; background: #f9fafb; border-radius: 5px;">
                                <strong class="risk-${v.severity}">${v.severity.toUpperCase()}</strong>: ${v.type}<br>
                                <small>${v.description}</small><br>
                                <strong style="color: #10b981;">Fix:</strong> ${v.remediation}
                            </div>
                        `).join('')}
                    ` : ''}
                    <p style="margin: 10px 0 0 0; font-size: 0.85em; color: #666;">Scan Duration: ${report.scanDuration}ms</p>
                </div>
            `;
        });

        document.getElementById('vuln-result').innerHTML = html;
    } catch (error) {
        displayResult('vuln-result', error.message, true);
    }
}

async function loadThreats() {
    showLoading('threats-result');

    try {
        const response = await fetch('/api/attacks/threats?limit=50');
        const data = await response.json();

        if (data.length === 0) {
            document.getElementById('threats-result').innerHTML = '<p>No threat intelligence found.</p>';
            return;
        }

        let html = `<h3>Threat Intelligence (${data.length} total)</h3>`;
        data.forEach(threat => {
            const confidenceColor = threat.confidence >= 80 ? '#ef4444' : threat.confidence >= 60 ? '#f59e0b' : '#3b82f6';

            html += `
                <div style="margin: 15px 0; padding: 15px; background: white; border-left: 5px solid ${confidenceColor}; border-radius: 8px;">
                    <div style="display: flex; justify-content: space-between;">
                        <div>
                            <h4 style="margin: 0;">⚠️ ${threat.threatType}</h4>
                            <p style="margin: 5px 0;"><strong>Source:</strong> ${threat.source}</p>
                            <p style="margin: 5px 0; font-size: 0.9em; color: #666;">${new Date(threat.timestamp).toLocaleString()}</p>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 2em; font-weight: bold; color: ${confidenceColor};">${threat.confidence}%</div>
                            <div style="font-size: 0.85em;">Confidence</div>
                        </div>
                    </div>
                    ${threat.indicators.length > 0 ? `
                        <div style="margin-top: 10px;">
                            <strong>Indicators:</strong>
                            <ul style="margin: 5px 0;">
                                ${threat.indicators.map(i => `<li>${i}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    <p style="margin: 10px 0 0 0;"><strong>Active Threats:</strong> <span class="warning">${threat.activeThreats}</span></p>
                </div>
            `;
        });

        document.getElementById('threats-result').innerHTML = html;
    } catch (error) {
        displayResult('threats-result', error.message, true);
    }
}

// ===== GUARDIAN ANGEL FUNCTIONS =====

async function getDailyBriefing() {
    const userId = document.getElementById('briefing-user').value;
    if (!userId) {
        alert('Please enter user ID');
        return;
    }

    showLoading('briefing-result');

    try {
        const response = await fetch(`/api/guardian/briefing/${userId}`);
        const data = await response.json();

        let html = `
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; margin-bottom: 15px;">
                <h2 style="margin: 0 0 10px 0;">${data.greeting}</h2>
                <p style="margin: 5px 0;">🌤️ ${data.weather}</p>
                <p style="margin: 5px 0;">📅 ${data.schedule}</p>
                <p style="margin: 5px 0;">💪 ${data.health}</p>
            </div>
        `;

        if (data.alerts.length > 0) {
            html += '<h4>⚠️ Pending Alerts:</h4>';
            data.alerts.forEach(alert => {
                const priorityColor = {
                    critical: '#ef4444',
                    high: '#f59e0b',
                    medium: '#3b82f6',
                    low: '#10b981'
                }[alert.priority];

                html += `
                    <div style="margin: 10px 0; padding: 10px; background: white; border-left: 5px solid ${priorityColor}; border-radius: 5px;">
                        <strong>${alert.title}</strong><br>
                        <small>${alert.message}</small>
                    </div>
                `;
            });
        }

        if (data.suggestions.length > 0) {
            html += '<h4>💡 Suggestions for Today:</h4><ul>';
            data.suggestions.forEach(suggestion => {
                html += `<li>${suggestion}</li>`;
            });
            html += '</ul>';
        }

        document.getElementById('briefing-result').innerHTML = html;
    } catch (error) {
        displayResult('briefing-result', error.message, true);
    }
}

async function trackHealth() {
    const userId = document.getElementById('health-user').value;
    const heartRate = parseInt(document.getElementById('heart-rate').value);
    const sleepHours = parseFloat(document.getElementById('sleep-hours').value);
    const steps = parseInt(document.getElementById('steps').value);
    const waterIntake = parseInt(document.getElementById('water-intake').value);
    const stressLevel = parseInt(document.getElementById('stress-level').value);

    if (!userId) {
        alert('Please enter user ID');
        return;
    }

    showLoading('health-track-result');

    try {
        const metrics = {};
        if (heartRate) metrics.heartRate = heartRate;
        if (sleepHours) metrics.sleepHours = sleepHours;
        if (steps) metrics.steps = steps;
        if (waterIntake) metrics.waterIntake = waterIntake;
        if (stressLevel) metrics.stress_level = stressLevel;

        const response = await fetch('/api/guardian/health', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, metrics })
        });

        const data = await response.json();

        let html = '<h3 class="success">✅ Health metrics recorded!</h3>';

        if (data.insights.length > 0) {
            html += '<h4>📊 Insights:</h4><ul>';
            data.insights.forEach(insight => {
                html += `<li>${insight}</li>`;
            });
            html += '</ul>';
        }

        if (data.alerts.length > 0) {
            html += '<h4>⚠️ New Alerts:</h4>';
            data.alerts.forEach(alert => {
                html += `
                    <div style="margin: 10px 0; padding: 10px; background: #fee2e2; border-radius: 5px;">
                        <strong>${alert.title}</strong><br>
                        <small>${alert.message}</small><br>
                        ${alert.actionRequired ? `<strong>Action:</strong> ${alert.actionRequired}` : ''}
                    </div>
                `;
            });
        }

        document.getElementById('health-track-result').innerHTML = html;

        // Clear form
        document.getElementById('heart-rate').value = '';
        document.getElementById('sleep-hours').value = '';
        document.getElementById('steps').value = '';
        document.getElementById('water-intake').value = '';
        document.getElementById('stress-level').value = '';
    } catch (error) {
        displayResult('health-track-result', error.message, true);
    }
}

async function analyzeWellness() {
    const userId = document.getElementById('wellness-user').value;
    if (!userId) {
        alert('Please enter user ID');
        return;
    }

    showLoading('wellness-result');

    try {
        const response = await fetch(`/api/guardian/wellness/${userId}`);
        const data = await response.json();

        const gradeColor = {
            'A': '#10b981',
            'B': '#3b82f6',
            'C': '#f59e0b',
            'D': '#f97316',
            'F': '#ef4444'
        }[data.overall >= 90 ? 'A' : data.overall >= 80 ? 'B' : data.overall >= 70 ? 'C' : data.overall >= 60 ? 'D' : 'F'];

        let html = `
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 4em; font-weight: bold; color: ${gradeColor};">${data.overall}</div>
                <div style="font-size: 1.5em; margin-top: 10px;">Overall Wellness Score</div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px;">
                <div style="text-align: center; padding: 15px; background: #f9fafb; border-radius: 8px;">
                    <div style="font-size: 2em; font-weight: bold;">${data.physical}</div>
                    <div>Physical</div>
                </div>
                <div style="text-align: center; padding: 15px; background: #f9fafb; border-radius: 8px;">
                    <div style="font-size: 2em; font-weight: bold;">${data.mental}</div>
                    <div>Mental</div>
                </div>
                <div style="text-align: center; padding: 15px; background: #f9fafb; border-radius: 8px;">
                    <div style="font-size: 2em; font-weight: bold;">${data.sleep}</div>
                    <div>Sleep</div>
                </div>
                <div style="text-align: center; padding: 15px; background: #f9fafb; border-radius: 8px;">
                    <div style="font-size: 2em; font-weight: bold;">${data.nutrition}</div>
                    <div>Nutrition</div>
                </div>
            </div>
        `;

        if (data.factors.length > 0) {
            html += '<h4>Detailed Analysis:</h4>';
            data.factors.forEach(factor => {
                html += `
                    <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 5px; border-left: 4px solid #667eea;">
                        <strong>${factor.name}</strong>: ${factor.score}/100 - ${factor.status}<br>
                        <small style="color: #666;">${factor.recommendation}</small>
                    </div>
                `;
            });
        }

        document.getElementById('wellness-result').innerHTML = html;
    } catch (error) {
        displayResult('wellness-result', error.message, true);
    }
}

function showAddScheduleForm() {
    const form = document.getElementById('add-schedule-form');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

async function addScheduleItem() {
    const title = document.getElementById('schedule-title').value;
    const startTime = document.getElementById('schedule-start').value;
    const endTime = document.getElementById('schedule-end').value;
    const priority = document.getElementById('schedule-priority').value;
    const category = document.getElementById('schedule-category').value;

    if (!title || !startTime || !endTime) {
        alert('Please fill in all required fields');
        return;
    }

    try {
        const response = await fetch('/api/guardian/schedule', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                priority,
                category,
                reminders: []
            })
        });

        const item = await response.json();
        alert(`Schedule item added: ${item.title}`);

        // Clear form and hide it
        document.getElementById('schedule-title').value = '';
        document.getElementById('schedule-start').value = '';
        document.getElementById('schedule-end').value = '';
        document.getElementById('add-schedule-form').style.display = 'none';

        // Reload schedule
        getSchedule();
    } catch (error) {
        alert('Failed to add schedule item');
    }
}

async function getSchedule() {
    const userId = document.getElementById('schedule-user').value;
    if (!userId) {
        alert('Please enter user ID');
        return;
    }

    showLoading('schedule-result');

    try {
        const response = await fetch(`/api/guardian/schedule/${userId}`);
        const data = await response.json();

        if (data.length === 0) {
            document.getElementById('schedule-result').innerHTML = '<p>No scheduled items found.</p>';
            return;
        }

        let html = `<h3>Your Schedule (${data.length} items)</h3>`;
        data.forEach(item => {
            const priorityColor = {
                high: '#ef4444',
                medium: '#f59e0b',
                low: '#10b981'
            }[item.priority];

            const start = new Date(item.startTime);
            const end = new Date(item.endTime);

            html += `
                <div style="margin: 10px 0; padding: 15px; background: ${item.completed ? '#f0f0f0' : 'white'}; border-left: 5px solid ${priorityColor}; border-radius: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div ${item.completed ? 'style="text-decoration: line-through;"' : ''}>
                            <h4 style="margin: 0;">${item.title}</h4>
                            <p style="margin: 5px 0; color: #666;">
                                📅 ${start.toLocaleString()} → ${end.toLocaleString()}
                            </p>
                            <span style="background: ${priorityColor}; color: white; padding: 3px 8px; border-radius: 5px; font-size: 0.8em;">
                                ${item.priority.toUpperCase()} PRIORITY
                            </span>
                            <span style="background: #e5e7eb; padding: 3px 8px; border-radius: 5px; font-size: 0.8em; margin-left: 5px;">
                                ${item.category}
                            </span>
                        </div>
                        ${!item.completed ? `<button onclick="completeScheduleItem('${item.id}')" style="padding: 5px 10px;">✓ Complete</button>` : '<span class="success">✅ Done</span>'}
                    </div>
                </div>
            `;
        });

        document.getElementById('schedule-result').innerHTML = html;
    } catch (error) {
        displayResult('schedule-result', error.message, true);
    }
}

async function completeScheduleItem(itemId) {
    try {
        await fetch(`/api/guardian/schedule/${itemId}/complete`, { method: 'PUT' });
        getSchedule();
    } catch (error) {
        alert('Failed to complete item');
    }
}

async function checkSafety() {
    const userId = document.getElementById('safety-user').value;
    if (!userId) {
        alert('Please enter user ID');
        return;
    }

    showLoading('safety-result');

    try {
        const response = await fetch('/api/guardian/safety', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });

        const data = await response.json();

        const scoreColor = data.safetyScore >= 90 ? '#10b981' : data.safetyScore >= 70 ? '#f59e0b' : '#ef4444';

        let html = `
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 4em; font-weight: bold; color: ${scoreColor};">${data.safetyScore}</div>
                <div style="font-size: 1.5em;">Safety Score</div>
            </div>
        `;

        if (data.alerts.length > 0) {
            html += '<h4>⚠️ Safety Alerts:</h4>';
            data.alerts.forEach(alert => {
                html += `
                    <div style="margin: 10px 0; padding: 10px; background: #fee2e2; border-radius: 5px;">
                        <strong>${alert.title}</strong><br>
                        <small>${alert.message}</small>
                    </div>
                `;
            });
        }

        if (data.recommendations.length > 0) {
            html += '<h4>Recommendations:</h4><ul>';
            data.recommendations.forEach(rec => {
                html += `<li>${rec}</li>`;
            });
            html += '</ul>';
        }

        document.getElementById('safety-result').innerHTML = html;
    } catch (error) {
        displayResult('safety-result', error.message, true);
    }
}

async function sendSOS() {
    const userId = document.getElementById('safety-user').value;
    if (!userId) {
        alert('Please enter user ID');
        return;
    }

    const confirmed = confirm('⚠️ This will send an emergency SOS alert. Continue?');
    if (!confirmed) return;

    showLoading('safety-result');

    try {
        const response = await fetch('/api/guardian/sos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });

        const data = await response.json();

        document.getElementById('safety-result').innerHTML = `
            <div style="background: #ef4444; color: white; padding: 20px; border-radius: 10px; text-align: center;">
                <h2 style="margin: 0;">🆘 SOS ACTIVATED</h2>
                <p style="margin: 10px 0;">Emergency ID: ${data.emergencyId}</p>
                <p style="margin: 10px 0;">Notified ${data.notifiedContacts} emergency contacts</p>
                <p style="margin: 10px 0; font-size: 0.9em;">Emergency services have been alerted</p>
            </div>
        `;
    } catch (error) {
        displayResult('safety-result', error.message, true);
    }
}

async function getGuardianAlerts() {
    const type = document.getElementById('alert-type-filter').value;
    showLoading('guardian-alerts-result');

    try {
        let url = '/api/guardian/alerts?acknowledged=false';
        if (type) url += `&type=${type}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.length === 0) {
            document.getElementById('guardian-alerts-result').innerHTML = '<p class="success">No pending alerts!</p>';
            return;
        }

        let html = `<h3>Pending Alerts (${data.length})</h3>`;
        data.forEach(alert => {
            const priorityColor = {
                critical: '#ef4444',
                high: '#f59e0b',
                medium: '#3b82f6',
                low: '#10b981'
            }[alert.priority];

            html += `
                <div style="margin: 10px 0; padding: 15px; background: white; border-left: 5px solid ${priorityColor}; border-radius: 8px;">
                    <div style="display: flex; justify-content: space-between;">
                        <div>
                            <h4 style="margin: 0; color: ${priorityColor};">${alert.title}</h4>
                            <p style="margin: 5px 0;">${alert.message}</p>
                            <p style="margin: 5px 0; font-size: 0.85em; color: #666;">${new Date(alert.timestamp).toLocaleString()}</p>
                            ${alert.actionRequired ? `<p style="margin: 5px 0;"><strong>Action Required:</strong> ${alert.actionRequired}</p>` : ''}
                        </div>
                        <button onclick="acknowledgeAlert('${alert.id}')" style="padding: 5px 10px; height: fit-content;">✓ Acknowledge</button>
                    </div>
                </div>
            `;
        });

        document.getElementById('guardian-alerts-result').innerHTML = html;
    } catch (error) {
        displayResult('guardian-alerts-result', error.message, true);
    }
}

async function acknowledgeAlert(alertId) {
    try {
        await fetch(`/api/guardian/alerts/${alertId}/acknowledge`, { method: 'PUT' });
        getGuardianAlerts();
    } catch (error) {
        alert('Failed to acknowledge alert');
    }
}

async function getHealthHistory() {
    const days = parseInt(document.getElementById('history-days').value) || 7;
    showLoading('history-result');

    try {
        const response = await fetch(`/api/guardian/health-history?days=${days}`);
        const data = await response.json();

        if (data.length === 0) {
            document.getElementById('history-result').innerHTML = '<p>No health data recorded yet. Start tracking!</p>';
            return;
        }

        let html = `<h3>Health History - Last ${days} Days (${data.length} records)</h3>`;
        html += '<div style="max-height: 400px; overflow-y: auto;">';

        data.reverse().forEach(record => {
            html += `
                <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 5px; border-left: 4px solid #667eea;">
                    <strong>${new Date(record.timestamp).toLocaleString()}</strong><br>
                    ${record.heartRate ? `❤️ Heart Rate: ${record.heartRate} bpm<br>` : ''}
                    ${record.sleepHours ? `😴 Sleep: ${record.sleepHours} hours<br>` : ''}
                    ${record.steps ? `🚶 Steps: ${record.steps}<br>` : ''}
                    ${record.waterIntake ? `💧 Water: ${record.waterIntake} ml<br>` : ''}
                    ${record.stress_level ? `😰 Stress: ${record.stress_level}/10<br>` : ''}
                </div>
            `;
        });

        html += '</div>';

        document.getElementById('history-result').innerHTML = html;
    } catch (error) {
        displayResult('history-result', error.message, true);
    }
}

// ===== CRYPTER FUNCTIONS =====

async function encryptPayload() {
    const payload = document.getElementById('crypter-payload').value;
    const type = document.getElementById('crypter-type').value;
    const method = document.getElementById('crypter-method').value;
    const addJunk = document.getElementById('crypter-junk').checked;
    const obfuscateStrings = document.getElementById('crypter-obfuscate').checked;

    if (!payload) {
        alert('Please enter a payload to encrypt');
        return;
    }

    showLoading('crypter-result');

    try {
        const response = await fetch('/api/crypter/encrypt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                payload,
                type,
                options: {
                    method,
                    addJunk,
                    obfuscateStrings
                }
            })
        });

        const data = await response.json();

        let html = '<h3>✅ Encryption Successful</h3>';
        html += `<p><strong>Method:</strong> ${data.method}</p>`;
        html += `<p><strong>Detection Rate:</strong> <span style="color: ${data.detectionRate.includes('Low') ? '#10b981' : '#ef4444'}">${data.detectionRate}</span></p>`;
        html += `<p><strong>Original Size:</strong> ${data.originalSize} bytes</p>`;
        html += `<p><strong>Encrypted Size:</strong> ${data.encryptedSize} bytes</p>`;

        if (data.key) {
            html += `<p><strong>🔑 Encryption Key:</strong> <code style="background: #1e293b; padding: 5px; border-radius: 3px; word-break: break-all;">${data.key}</code></p>`;
            html += '<p style="color: #f59e0b;">⚠️ Save this key - you\'ll need it to decrypt!</p>';
        }

        html += '<h4>Encrypted Payload:</h4>';
        html += `<textarea readonly style="width: 100%; height: 300px; font-family: monospace; background: #1e293b; color: #10b981; padding: 10px; border-radius: 5px;">${data.encrypted}</textarea>`;
        html += '<button onclick="copyToClipboard(this.previousElementSibling.value)" style="margin-top: 10px;">📋 Copy to Clipboard</button>';

        document.getElementById('crypter-result').innerHTML = html;
    } catch (error) {
        displayResult('crypter-result', error.message, true);
    }
}

async function obfuscateHTML() {
    const html = document.getElementById('html-input').value;
    const method = document.getElementById('html-method').value;

    if (!html) {
        alert('Please enter HTML to obfuscate');
        return;
    }

    showLoading('html-result');

    try {
        const response = await fetch('/api/crypter/obfuscate-html', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                html,
                options: {
                    method,
                    addJunk: true,
                    obfuscateStrings: true
                }
            })
        });

        const data = await response.json();

        let html_output = '<h3>✅ HTML Obfuscation Successful</h3>';
        html_output += '<h4>Obfuscated HTML:</h4>';
        html_output += `<textarea readonly style="width: 100%; height: 300px; font-family: monospace; background: #1e293b; color: #10b981; padding: 10px; border-radius: 5px;">${data.obfuscated}</textarea>`;
        html_output += '<button onclick="copyToClipboard(this.previousElementSibling.value)" style="margin-top: 10px;">📋 Copy to Clipboard</button>';

        document.getElementById('html-result').innerHTML = html_output;
    } catch (error) {
        displayResult('html-result', error.message, true);
    }
}

async function decryptPayload() {
    const encrypted = document.getElementById('decrypt-payload').value;
    const key = document.getElementById('decrypt-key').value;
    const method = document.getElementById('decrypt-method').value;

    if (!encrypted || !key) {
        alert('Please enter both encrypted payload and key');
        return;
    }

    showLoading('decrypt-result');

    try {
        const response = await fetch('/api/crypter/decrypt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ encrypted, method, key })
        });

        const data = await response.json();

        let html = '<h3>✅ Decryption Successful</h3>';
        html += '<h4>Decrypted Payload:</h4>';
        html += `<textarea readonly style="width: 100%; height: 200px; font-family: monospace; background: #1e293b; color: #10b981; padding: 10px; border-radius: 5px;">${data.decrypted}</textarea>`;
        html += '<button onclick="copyToClipboard(this.previousElementSibling.value)" style="margin-top: 10px;">📋 Copy to Clipboard</button>';

        document.getElementById('decrypt-result').innerHTML = html;
    } catch (error) {
        displayResult('decrypt-result', 'Decryption failed - check your key and method', true);
    }
}

async function generateStub() {
    const encryptedPayload = document.getElementById('stub-encrypted').value;
    const key = document.getElementById('stub-key').value;
    const method = document.getElementById('stub-method').value;

    if (!encryptedPayload || !key) {
        alert('Please enter both encrypted payload and key');
        return;
    }

    showLoading('stub-result');

    try {
        const response = await fetch('/api/crypter/generate-stub', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ encryptedPayload, method, key })
        });

        const data = await response.json();

        let html = '<h3>✅ Stub Generated Successfully</h3>';
        html += '<p>This stub can be executed standalone to load your encrypted payload.</p>';
        html += '<h4>Crypter Stub:</h4>';
        html += `<textarea readonly style="width: 100%; height: 300px; font-family: monospace; background: #1e293b; color: #10b981; padding: 10px; border-radius: 5px;">${data.stub}</textarea>`;
        html += '<button onclick="copyToClipboard(this.previousElementSibling.value)" style="margin-top: 10px;">📋 Copy to Clipboard</button>';
        html += '<br><button onclick="downloadFile(this.parentElement.querySelector(\'textarea\').value, \'stub.js\')" style="margin-top: 10px;">💾 Download as stub.js</button>';

        document.getElementById('stub-result').innerHTML = html;
    } catch (error) {
        displayResult('stub-result', error.message, true);
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('✅ Copied to clipboard!');
    }).catch(() => {
        alert('❌ Failed to copy to clipboard');
    });
}

function downloadFile(content, filename) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// Initialize
console.log('Cyber Lab Interface loaded successfully!');
