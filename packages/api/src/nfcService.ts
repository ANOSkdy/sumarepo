import { base } from '@sumarepo/shared'; // パッケージ名で指定します
import type { NfcConfigResponse } from '@sumarepo/shared';

/**
 * Finds the Airtable record ID for a given value in a specific field.
 * @param tableName The name of the table to search.
 * @param fieldName The name of the field to search in.
 * @param value The value to search for.
 * @returns The Airtable record ID.
 * @throws If the record is not found.
 */
async function findRecordIdByField(tableName: string, fieldName: string, value: string): Promise<string> {
  try {
    const records = await base(tableName)
      .select({
        filterByFormula: `{${fieldName}} = '${value}'`,
        maxRecords: 1,
      })
      .firstPage();

    if (records.length > 0) {
      return records[0].id;
    } else {
      throw new Error(`Record not found in ${tableName} where ${fieldName} = ${value}`);
    }
  } catch (error) {
    console.error(`Error finding record in ${tableName}:`, error);
    throw error;
  }
}

/**
 * Calculates the distance between two points on Earth using the Haversine formula.
 * @param lat1 Latitude of the first point.
 * @param lon1 Longitude of the first point.
 * @param lat2 Latitude of the second point.
 * @param lon2 Longitude of the second point.
 * @returns The distance in kilometers.
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

interface RecordNfcStampParams {
  userId: string;
  machineId: string;
  latitude: number;
  longitude: number;
  workDescription: string;
}

/**
 * Records a new NFC stamp event in Airtable.
 * It finds the nearest site, determines the log type (IN/OUT), and creates a new log record.
 * @param params The parameters for the NFC stamp.
 * @returns The newly created log record.
 */
export async function recordNfcStamp(params: RecordNfcStampParams): Promise<Record<FieldSet>> {
  const { userId, machineId, latitude, longitude, workDescription } = params;

  // 1. Find the nearest site
  const activeSites = await base('Sites')
    .select({ filterByFormula: '{active} = 1' })
    .all();

  if (activeSites.length === 0) {
    throw new Error('No active sites found in Airtable.');
  }

  let nearestSite: Record<FieldSet> | null = null;
  let minDistance = Infinity;

  activeSites.forEach(site => {
    const siteLat = site.get('lat') as number;
    const siteLon = site.get('lon') as number;
    const distance = calculateDistance(latitude, longitude, siteLat, siteLon);

    if (distance < minDistance) {
      minDistance = distance;
      nearestSite = site;
    }
  });

  if (!nearestSite) {
    throw new Error('Could not determine the nearest site.');
  }
  const siteName = nearestSite.get('name') as string;

  // 2. Determine the log type (IN or OUT)
  // Get the current date in JST (YYYY-MM-DD format)
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(now);
  const year = parts.find(p => p.type === 'year')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  const day = parts.find(p => p.type === 'day')?.value;
  const todayJST = `${year}-${month}-${day}`;

  const userLogsToday = await base('Logs')
    .select({
      // Note: Assumes a lookup field 'lookup_userId' exists in the 'Logs' table
      // that provides the 'userId' from the linked 'Users' record.
      filterByFormula: `AND({lookup_userId} = '${userId}', {date} = '${todayJST}')`,
    })
    .all();

  const logType = userLogsToday.length % 2 === 0 ? 'IN' : 'OUT';

  // 3. Get User and Machine record IDs
  const userRecordId = await findRecordIdByField('Users', 'userId', userId);
  const machineRecordId = await findRecordIdByField('Machines', 'machineid', machineId);

  // 4. Create the new log record
  const newLog = await base('Logs').create([
    {
      fields: {
        user: [userRecordId],
        machine: [machineRecordId],
        siteName: siteName,
        workDescription: workDescription,
        lat: latitude,
        lon: longitude,
        type: logType,
        date: todayJST,
        // The 'timestamp' field is expected to be set automatically by Airtable
        // to the creation time of the record.
      },
    },
  ]);

  return newLog[0];
}





