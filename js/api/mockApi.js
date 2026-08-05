/* ============================================================
   GymPro - Mock API
   Simulates a real backend with realistic loading delays (300-800ms).
   To reconnect to the real FastAPI backend later, replace the
   implementation of each method here with actual fetch() calls.
   ============================================================ */
const GymProApi = (() => {
  const { delay } = window.GymProUtils;

  // Wraps any operation with a simulated network delay
  async function request(operation) {
    await delay();
    try {
      const result = await operation();
      return { data: result, error: null };
    } catch (err) {
      console.error('API error', err);
      return { data: null, error: err.message || 'Request failed' };
    }
  }

  // Throw helper for services
  function fail(msg) {
    throw new Error(msg);
  }

  return { request, delay, fail };
})();

window.GymProApi = GymProApi;
