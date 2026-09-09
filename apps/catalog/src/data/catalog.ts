import raw from './catalog.json';
import type { Domain, Topic, TopicCatalog } from '../types/catalog';

export const catalog = raw as unknown as TopicCatalog;

export const domains: Domain[] = catalog.domains;

const byId = new Map<string, Topic>(
  catalog.domains.flatMap((d) => d.topics.map((t) => [t.id, t] as const)),
);

const domainOfTopic = new Map<string, Domain>(
  catalog.domains.flatMap((d) => d.topics.map((t) => [t.id, d] as const)),
);

export function findTopic(id: string): Topic | undefined {
  return byId.get(id);
}

export function domainOf(topicId: string): Domain | undefined {
  return domainOfTopic.get(topicId);
}

export function implementedCount(domain: Domain): number {
  return domain.topics.reduce((n, t) => (t.simId || t.labUrl ? n + 1 : n), 0);
}

/** 이 주제에 열어 볼 것이 있는가 (엔진 번들이든 자립 조각이든). */
export function isViewable(topic: Topic): boolean {
  return Boolean(topic.simId || topic.labUrl);
}
