export interface NotificationProvider {
  /** unique name for the provider */
  name: string;
  /** send a notification */
  send(message: string): Promise<void>;
}

export class NotificationService {
  private providers: Map<string, NotificationProvider> = new Map();

  registerProvider(provider: NotificationProvider) {
    this.providers.set(provider.name, provider);
    console.log(`Registered notification provider: ${provider.name}`);
  }

  async notifyAll(message: string): Promise<void> {
    const results = await Promise.allSettled(
      Array.from(this.providers.values()).map((p) => p.send(message))
    );

    results.forEach((res, index) => {
      if (res.status === "rejected") {
        const providerName = Array.from(this.providers.keys())[index];
        console.error(`Failed to send via ${providerName}:`, res.reason);
      }
    });
  }
}
