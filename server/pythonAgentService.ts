/**
 * Python Agent Service
 * Bridge between TypeScript LangGraph orchestrator and Python LitServe agents
 */

import axios from "axios";

const TERMINAL_AGENT_URL = process.env.TERMINAL_AGENT_URL || "http://localhost:8001";
const SDK_AGENT_URL = process.env.SDK_AGENT_URL || "http://localhost:8002";

export interface TerminalAgentResponse {
  stdout: string;
  stderr: string;
  returncode: number;
  analysis: string;
  agent: string;
}

export interface SDKAgentResponse {
  response: string;
  status: string;
  agent: string;
  mode: string;
  query: string;
}

export class PythonAgentService {
  /**
   * Check if Python agents are running
   */
  async checkHealth(): Promise<{ terminal: boolean; sdk: boolean }> {
    try {
      const [terminalHealth, sdkHealth] = await Promise.all([
        axios.get(`${TERMINAL_AGENT_URL}/health`, { timeout: 2000 }).then(() => true).catch(() => false),
        axios.get(`${SDK_AGENT_URL}/health`, { timeout: 2000 }).then(() => true).catch(() => false),
      ]);

      return {
        terminal: terminalHealth,
        sdk: sdkHealth,
      };
    } catch (error) {
      return { terminal: false, sdk: false };
    }
  }

  /**
   * Execute a terminal command via Terminal Agent
   */
  async executeCommand(command: string): Promise<TerminalAgentResponse> {
    try {
      const response = await axios.post(
        `${TERMINAL_AGENT_URL}/predict`,
        { command },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 35000, // 35 seconds (agent has 30s timeout)
        }
      );

      return response.data;
    } catch (error: any) {
      console.error("Terminal agent error:", error.message);
      throw new Error(`Terminal agent execution failed: ${error.message}`);
    }
  }

  /**
   * Query SDK Agent for help/guidance
   */
  async querySDK(query: string, context: any = {}, useAI: boolean = true): Promise<SDKAgentResponse> {
    try {
      const response = await axios.post(
        `${SDK_AGENT_URL}/predict`,
        {
          query,
          context,
          use_ai: useAI,
        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 30000,
        }
      );

      return response.data;
    } catch (error: any) {
      console.error("SDK agent error:", error.message);
      throw new Error(`SDK agent query failed: ${error.message}`);
    }
  }

  /**
   * Execute task through appropriate Python agent
   */
  async executeTask(task: string, agentType: "terminal" | "sdk"): Promise<any> {
    if (agentType === "terminal") {
      return await this.executeCommand(task);
    } else if (agentType === "sdk") {
      return await this.querySDK(task);
    } else {
      throw new Error(`Unknown Python agent type: ${agentType}`);
    }
  }
}

export const pythonAgentService = new PythonAgentService();
