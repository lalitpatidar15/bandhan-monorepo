const test = require('node:test');
const assert = require('node:assert/strict');
const { buildConversationQuoteContext } = require('../utils/chatEligibility');

test('buildConversationQuoteContext returns quote metadata for a matching quote', () => {
  const quote = {
    _id: 'quote_123',
    status: 'pending',
    eventDate: '2026-10-10',
    guestRange: '100-150',
    budget: 850010,
    note: 'Need a premium setup',
    services: ['Decoration', 'Catering'],
    fullName: 'Asha Rao',
    phone: '9876543210',
    email: 'asha@example.com',
  };

  const ctx = buildConversationQuoteContext({ quote });

  assert.equal(ctx.quoteId, 'quote_123');
  assert.equal(ctx.quoteStatus, 'pending');
  assert.equal(ctx.quoteEventDate, '2026-10-10');
  assert.deepEqual(ctx.quoteServices, ['Decoration', 'Catering']);
  assert.equal(ctx.quoteNote, 'Need a premium setup');
});

test('buildConversationQuoteContext returns empty metadata when no quote is available', () => {
  const ctx = buildConversationQuoteContext({ quote: null });

  assert.equal(ctx.quoteId, '');
  assert.equal(ctx.quoteStatus, '');
  assert.equal(ctx.quoteEventDate, '');
  assert.deepEqual(ctx.quoteServices, []);
  assert.equal(ctx.quoteNote, '');
});

test('buildConversationQuoteContext detects venue quotes from the quote payload', () => {
  const ctx = buildConversationQuoteContext({ quote: { _id: 'quote_venue', status: 'pending', eventDate: '2026-10-10', listingType: 'venue' } });

  assert.equal(ctx.quoteId, 'quote_venue');
  assert.equal(ctx.quoteStatus, 'pending');
  assert.equal(ctx.quoteEventDate, '2026-10-10');
  assert.equal(ctx.quoteListingType, 'venue');
});
