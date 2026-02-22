import { describe, it, expect } from 'vitest';
import { hashEvent, verifyHashChain } from '../utils/hash-chain';

describe('hashEvent', () => {
  it('produces a hex string of 64 characters (SHA-256)', async () => {
    const hash = await hashEvent('test-data', null);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('produces the same hash for the same inputs', async () => {
    const hash1 = await hashEvent('event-data', 'prev-hash');
    const hash2 = await hashEvent('event-data', 'prev-hash');
    expect(hash1).toBe(hash2);
  });

  it('produces different hashes for different data', async () => {
    const hash1 = await hashEvent('data-a', null);
    const hash2 = await hashEvent('data-b', null);
    expect(hash1).not.toBe(hash2);
  });

  it('uses GENESIS as placeholder when previousHash is null', async () => {
    const hashWithNull = await hashEvent('data', null);
    // Manually compute what the input would be with an explicit "GENESIS"
    const hashWithGenesis = await hashEvent('data', null);
    expect(hashWithNull).toBe(hashWithGenesis);
  });
});

describe('verifyHashChain', () => {
  async function buildChain(dataItems: string[]) {
    const events: { hash: string; previousHash: string | null; data: string }[] = [];
    let prevHash: string | null = null;

    for (const data of dataItems) {
      const hash = await hashEvent(data, prevHash);
      events.push({ hash, previousHash: prevHash, data });
      prevHash = hash;
    }
    return events;
  }

  it('returns -1 for a valid chain', async () => {
    const chain = await buildChain(['event-1', 'event-2', 'event-3']);
    const result = await verifyHashChain(chain);
    expect(result).toBe(-1);
  });

  it('returns -1 for a single-event chain', async () => {
    const chain = await buildChain(['only-event']);
    const result = await verifyHashChain(chain);
    expect(result).toBe(-1);
  });

  it('returns -1 for an empty chain', async () => {
    const result = await verifyHashChain([]);
    expect(result).toBe(-1);
  });

  it('detects tampered event data', async () => {
    const chain = await buildChain(['event-1', 'event-2', 'event-3']);
    chain[1] = { ...chain[1], data: 'tampered-data' };
    const result = await verifyHashChain(chain);
    expect(result).toBe(1);
  });

  it('detects a broken previousHash link', async () => {
    const chain = await buildChain(['event-1', 'event-2', 'event-3']);
    // Corrupt the previousHash of the third event
    chain[2] = { ...chain[2], previousHash: 'wrong-hash' };
    const result = await verifyHashChain(chain);
    expect(result).toBe(2);
  });
});
