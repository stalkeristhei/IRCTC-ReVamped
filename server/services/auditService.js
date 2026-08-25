async function recordAuditEvent(pool, { accountId = null, requestId, eventType, metadata = {} }) {
  await pool.query(
    `INSERT INTO audit_events (account_id, request_id, event_type, metadata)
     VALUES ($1, $2, $3, $4::jsonb)`,
    [accountId, requestId, eventType, JSON.stringify(metadata)],
  );
}

module.exports = { recordAuditEvent };
