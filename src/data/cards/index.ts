import type { Card } from '../../types';
import action from './action';
import youth from './youth';
import region from './region';
import destiny from './destiny';
import world from './world';

export const CARD_LIST: Card[] = [...action, ...youth, ...region, ...destiny, ...world];

export const CARDS: Record<string, Card> = {};
for (const c of CARD_LIST) {
  if (CARDS[c.id]) throw new Error(`카드 id 중복: ${c.id}`);
  CARDS[c.id] = c;
}
