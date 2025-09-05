import Airtable from 'airtable';

const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID;

if (!apiKey || !baseId) {
  throw new Error('Airtable API key or Base ID are not defined in environment variables.');
}

Airtable.configure({
  apiKey: apiKey,
});

const base = Airtable.base(baseId);

export const Users = base('Users');
export const Machines = base('Machines');
export const Sites = base('Sites');
export const WorkTypes = base('WorkTypes');
export const Logs = base('Logs');

export default base;
