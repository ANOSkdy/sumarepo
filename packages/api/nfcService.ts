import { formatInTimeZone } from 'date-fns-tz';
import { Logs, WorkTypes, Users, Machines } from './airtable';
import type { NfcConfigResponse, ClockedInState, ClockedOutState } from '@shared/types';
import type { FieldSet, Record } from 'airtable';

/**
 * JSTの現在日付を 'YYYY-MM-DD' 形式で取得する
 * @returns {string} JSTの現在日付
 */
function getCurrentJstDate(): string {
  const now = new Date();
  const timeZone = 'Asia/Tokyo';
  return formatInTimeZone(now, timeZone, 'yyyy-MM-dd');
}

/**
 * ユーザーIDを基に、その日の打刻履歴から現在の状態を判定し、
 * NFC画面表示に必要な設定情報を返す。
 * @param userId - 従業員マスタのuserId (例: 'user_001')
 * @returns {Promise<NfcConfigResponse>}
 */
export async function getNfcConfig(userId: string): Promise<NfcConfigResponse> {
  const todayJst = getCurrentJstDate();

  // AirtableのFormulaでは、Linkされている先のレコードのフィールドを直接参照するのが難しい。
  // そのため、ここでは 'Logs' テーブルに 'userId' (UsersテーブルのuserIdを引いたLookupフィールド)
  // が存在することを前提とする。
  const filterFormula = `AND({userId_lookup} = '${userId}', {date} = '${todayJst}')`;

  const todaysLogs = await Logs.select({
    filterByFormula: filterFormula,
    fields: ['id'], // Counting records is enough
  }).all();

  const isClockedIn = todaysLogs.length % 2 !== 0;

  if (isClockedIn) {
    return getClockedInState(filterFormula);
  } else {
    return getClockedOutState();
  }
}

async function getClockedInState(filterFormula: string): Promise<ClockedInState> {
  // Get the most recent log entry
  const lastLogRecords = await Logs.select({
    filterByFormula: filterFormula,
    maxRecords: 1,
    sort: [{ field: 'timestamp', direction: 'desc' }],
    fields: ['user', 'machine', 'siteName', 'workDescription'],
  }).firstPage();

  if (lastLogRecords.length === 0) {
    // This should theoretically not happen if isClockedIn is true, but as a safeguard:
    throw new Error('Consistency Error: Could not find the last clock-in log despite an odd record count.');
  }

  const lastLog = lastLogRecords[0];

  // Fetch linked records' names
  const [userName, machineName] = await Promise.all([
    fetchLinkedRecordName(Users, lastLog.get('user') as string[]),
    fetchLinkedRecordName(Machines, lastLog.get('machine') as string[]),
  ]);

  return {
    isClockedIn: true,
    clockInInfo: {
      userName: userName,
      siteName: lastLog.get('siteName') as string || '',
      machineName: machineName,
      workDescription: lastLog.get('workDescription') as string || '',
    },
  };
}

async function getClockedOutState(): Promise<ClockedOutState> {
  const activeWorkTypes = await WorkTypes.select({
    filterByFormula: '{active} = 1',
    sort: [{ field: 'sortOrder', direction: 'asc' }],
    fields: ['name'],
  }).all();

  const workOptions = activeWorkTypes.map((record) => record.get('name') as string);

  return {
    isClockedIn: false,
    workOptions: workOptions,
  };
}

/**
 * Fetches the 'name' field from a linked record.
 * @param table - The Airtable table object (e.g., Users, Machines).
 * @param recordIds - An array of record IDs (usually just one from a log).
 * @returns The name of the record, or a placeholder if not found.
 */
async function fetchLinkedRecordName(table: Airtable.Table<FieldSet>, recordIds: string[]): Promise<string> {
  if (!recordIds || recordIds.length === 0) {
    return 'N/A';
  }
  try {
    const record = await table.find(recordIds[0]);
    return record.get('name') as string;
  } catch (error) {
    console.error(`Error fetching linked record from ${table.name}:`, error);
    return 'Error';
  }
}
