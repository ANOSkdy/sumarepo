import Airtable, { FieldSet, Record } from 'airtable';

// Initialize Airtable
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID as string);

export interface NfcConfig {
  status: 'checked_in' | 'checked_out';
  action: 'check_in' | 'check_out';
  lastLogId?: string;
  lastLogTime?: string;
}

/**
 * Retrieves the NFC configuration for a given user.
 * This function determines if the user's next action should be to check in or check out.
 *
 * @param userId The ID of the user.
 * @returns A promise that resolves to the NFC configuration.
 */
export async function getNfcConfig(userId: string): Promise<NfcConfig> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const records: Record<FieldSet>[] = await base('Logs')
      .select({
        // We assume a lookup field 'lookup_userId' exists in the 'Logs' table
        // that looks up the 'userId' from the linked 'Users' record.
        filterByFormula: `{lookup_userId} = '${userId}'`,
        sort: [{ field: 'timestamp', direction: 'desc' }],
        maxRecords: 1,
      })
      .firstPage();

    if (records.length === 0) {
      // No previous logs, user needs to check in.
      return {
        status: 'checked_out',
        action: 'check_in',
      };
    }

    const lastLog = records[0];
    const lastLogType = lastLog.get('type');

    if (lastLogType === 'OUT') {
      // Last action was checking out, user needs to check in.
      return {
        status: 'checked_out',
        action: 'check_in',
      };
    } else {
      // Last action was checking in, user needs to check out.
      return {
        status: 'checked_in',
        action: 'check_out',
        lastLogId: lastLog.id,
        lastLogTime: lastLog.get('timestamp') as string,
      };
    }
  } catch (error) {
    console.error('Failed to get NFC config from Airtable:', error);
    throw new Error('Could not retrieve NFC configuration.');
  }
}
