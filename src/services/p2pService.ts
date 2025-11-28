
import {
  BaseModule,
  Module,
  OperationContext,
} from './moduleInterface';

// NOTE: The real implementation using libp2p was reverted because libp2p is an
// ESM-only library, and this project is currently a CommonJS project.
// This mock service simulates the API for other components to use.

export interface DirectMessage {
  to: string; // Peer ID
  topic: string;
  payload: Buffer;
}

export interface GossipMessage {
  topic: string;
  payload: Buffer;
}

@Module({
  name: 'P2PService',
  version: '1.0.0',
  description: 'Handles direct and gossip P2P communication between agents.',
  category: 'System',
  author: 'GodBrain',
})
export class P2PService extends BaseModule {
  readonly capabilities = {
    operations: ['gossip', 'sendDirectMessage', 'getPeers'],
    inputTypes: ['GossipMessage', 'DirectMessage'],
    outputTypes: ['json'],
    supportsConcurrency: true,
    requiresAuthentication: false,
    requiresExternalAPIs: [],
  };

  private peerId: string = `mock-peer-${Math.random().toString(36).substring(2, 9)}`;

  protected async onInitialize(): Promise<void> {
    console.log(`[${this.metadata.name}] Initialized with mock Peer ID: ${this.peerId}`);
  }

  protected async onStart(): Promise<void> {
    console.log(`[${this.metadata.name}] Mock P2P network started. No real connections made.`);
  }

  protected async onStop(): Promise<void> {
    console.log(`[${this.metadata.name}] Mock P2P network stopped.`);
  }

  protected async checkDependencies(): Promise<any[]> {
    return [];
  }

  protected async onExecute(
    operation: string,
    params: GossipMessage | DirectMessage,
    context: OperationContext
  ): Promise<any> {
    switch (operation) {
      case 'gossip':
        return this.gossip(params as GossipMessage);
      case 'sendDirectMessage':
        return this.sendDirectMessage(params as DirectMessage);
       case 'getPeers':
        return this.getPeers();
      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }
  }

  private async gossip(message: GossipMessage): Promise<{ status: string }> {
    console.log(`[${this.metadata.name}] MOCK GOSSIP on topic '${message.topic}': ${message.payload.toString()}`);
    return { status: 'gossip_sent' };
  }

  private async sendDirectMessage(message: DirectMessage): Promise<{ status: string }> {
    console.log(`[${this.metadata.name}] MOCK DIRECT MESSAGE to '${message.to}' on topic '${message.topic}': ${message.payload.toString()}`);
    return { status: 'direct_message_sent' };
  }
  
  private getPeers(): string[] {
    return [this.peerId, `mock-peer-${Math.random().toString(36).substring(2, 9)}`];
  }
}
