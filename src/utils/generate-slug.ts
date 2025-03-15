/**
 * Generates a URL-friendly slug from the given event name.
 *
 * This function normalizes the input string by removing diacritical marks,
 * converting it to lowercase, trimming whitespace, and replacing spaces and
 * invalid characters with hyphens.
 *
 * @param {string} eventName - The name of the event to generate a slug for.
 * @returns {string} The generated slug.
 */
function generateSlug(eventName: string): string {
  return eventName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default generateSlug;
