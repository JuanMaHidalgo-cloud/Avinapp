export const isValidPolicyId = (id) => {
  return typeof id === 'string' && id.length >= 10;
};

export const isValidPolicyRecord = (record) => {
  return (
    record &&
    isValidPolicyId(record.id) &&
    typeof record.broker_id === 'string' &&
    record.broker_id.length > 0 &&
    typeof record.numero_poliza === 'string' &&
    record.numero_poliza.length > 0
  );
};

const fetchLocks = new Set();

export const acquireFetchLock = (id) => {
  if (!id || typeof id !== 'string') return false;
  if (fetchLocks.has(id)) return false;
  fetchLocks.add(id);
  return true;
};

export const releaseFetchLock = (id) => {
  if (id) fetchLocks.delete(id);
};