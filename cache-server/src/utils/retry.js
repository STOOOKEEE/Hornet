import logger from './logger.js';

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in ms
 * @param {string} operationName - Name for logging
 */
export async function retryWithBackoff(
  fn,
  maxRetries = 3,
  baseDelay = 1000,
  operationName = 'operation'
) {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        logger.warn(
          `${operationName} failed (attempt ${attempt + 1}/${maxRetries + 1}). Retrying in ${delay}ms...`,
          { error: error.message }
        );
        await sleep(delay);
      }
    }
  }

  logger.error(`${operationName} failed after ${maxRetries + 1} attempts`, {
    error: lastError.message,
  });
  throw lastError;
}

/**
 * Sleep for a given duration
 * @param {number} ms - Duration in milliseconds
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default { retryWithBackoff, sleep };
