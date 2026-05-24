import {
  getGrantedPermissions,
  getSdkStatus,
  initialize,
  readRecords,
  requestPermission,
  SdkAvailabilityStatus,
  type Permission,
  type ReadHealthDataHistoryPermission,
  type ReadRecordsResult,
  type RecordType,
} from 'react-native-health-connect';

export const HEALTH_CONNECT_RECORD_TYPES: RecordType[] = [
  'ActiveCaloriesBurned',
  'BasalBodyTemperature',
  'BasalMetabolicRate',
  'BloodGlucose',
  'BloodPressure',
  'BodyFat',
  'BodyTemperature',
  'BodyWaterMass',
  'BoneMass',
  'CervicalMucus',
  'CyclingPedalingCadence',
  'Distance',
  'ElevationGained',
  'ExerciseSession',
  'FloorsClimbed',
  'HeartRate',
  'HeartRateVariabilityRmssd',
  'Height',
  'Hydration',
  'IntermenstrualBleeding',
  'LeanBodyMass',
  'MenstruationFlow',
  'MenstruationPeriod',
  'Nutrition',
  'OvulationTest',
  'OxygenSaturation',
  'Power',
  'RespiratoryRate',
  'RestingHeartRate',
  'SexualActivity',
  'SleepSession',
  'Speed',
  'Steps',
  'StepsCadence',
  'TotalCaloriesBurned',
  'Vo2Max',
  'Weight',
  'WheelchairPushes',
];

export const SAMSUNG_HEALTH_SYNC_RECORD_TYPES: RecordType[] = [
  'Steps',
  'BloodGlucose',
  'OxygenSaturation',
  'BloodPressure',
  'ExerciseSession',
  'TotalCaloriesBurned',
  'Distance',
  'HeartRate',
  'Power',
  'Speed',
  'Vo2Max',
  'Nutrition',
  'SleepSession',
  'Weight',
  'BodyFat',
  'BasalMetabolicRate',
  'Height',
];

export const QUEST_VERIFICATION_RECORD_TYPES: RecordType[] = [
  'ExerciseSession',
  'Steps',
  'Distance',
  'ActiveCaloriesBurned',
  'TotalCaloriesBurned',
  'HeartRate',
  'Speed',
  'Power',
];

export interface HealthConnectReadOptions {
  startTime: string | Date;
  endTime?: string | Date;
  pageSize?: number;
  recordTypes?: RecordType[];
}

export interface HealthConnectRecordReadResult {
  recordType: RecordType;
  records: unknown[];
  pageToken?: string;
  error?: string;
}

export interface HealthConnectReadAllResult {
  grantedRecordTypes: RecordType[];
  deniedRecordTypes: RecordType[];
  results: HealthConnectRecordReadResult[];
}

export interface HealthMetricSampleRequest {
  type?: string;
  value: number;
  unit?: string;
  startTime: string;
  endTime?: string;
  source: 'health_connect' | string;
  dataOrigin?: string;
  rawRecordType?: string;
}

export interface QuestHealthSampleReadResult {
  samples: HealthMetricSampleRequest[];
  grantedRecordTypes: RecordType[];
  deniedRecordTypes: RecordType[];
}

function toIsoString(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : value;
}

function readPermissions(recordTypes: RecordType[]): Permission[] {
  return recordTypes.map(recordType => ({
    accessType: 'read',
    recordType,
  }));
}

export async function isHealthConnectAvailable(): Promise<boolean> {
  const status = await getSdkStatus();
  return status === SdkAvailabilityStatus.SDK_AVAILABLE;
}

export async function initializeHealthConnect(): Promise<void> {
  const available = await isHealthConnectAvailable();
  if (!available) {
    throw new Error('Health Connect is not available on this device.');
  }

  const initialized = await initialize();
  if (!initialized) {
    throw new Error('Health Connect initialization failed.');
  }
}

export async function requestAllHealthConnectReadPermissions(
  recordTypes: RecordType[] = HEALTH_CONNECT_RECORD_TYPES,
  includeHistoryPermission = true,
): Promise<RecordType[]> {
  await initializeHealthConnect();

  const permissions: (Permission | ReadHealthDataHistoryPermission)[] = [
    ...readPermissions(recordTypes),
  ];

  if (includeHistoryPermission) {
    permissions.push({
      accessType: 'read',
      recordType: 'ReadHealthDataHistory',
    });
  }

  const grantedPermissions = await requestPermission(permissions);

  return grantedPermissions
    .filter(
      (permission): permission is Permission =>
        permission.accessType === 'read' &&
        recordTypes.includes(permission.recordType as RecordType),
    )
    .map(permission => permission.recordType);
}

export async function getGrantedHealthConnectRecordTypes(): Promise<RecordType[]> {
  const grantedPermissions = await getGrantedPermissions();

  return grantedPermissions
    .filter(
      (permission): permission is Permission =>
        permission.accessType === 'read' &&
        HEALTH_CONNECT_RECORD_TYPES.includes(permission.recordType as RecordType),
    )
    .map(permission => permission.recordType);
}

export async function readHealthConnectRecordType(
  recordType: RecordType,
  options: HealthConnectReadOptions,
): Promise<ReadRecordsResult<RecordType>> {
  await initializeHealthConnect();

  return readRecords(recordType, {
    timeRangeFilter: {
      operator: 'between',
      startTime: toIsoString(options.startTime),
      endTime: toIsoString(options.endTime ?? new Date()),
    },
    ascendingOrder: true,
    pageSize: options.pageSize ?? 1000,
  });
}

export async function readAllHealthConnectData(
  options: HealthConnectReadOptions,
): Promise<HealthConnectReadAllResult> {
  const recordTypes = options.recordTypes ?? HEALTH_CONNECT_RECORD_TYPES;
  const grantedRecordTypes =
    await requestAllHealthConnectReadPermissions(recordTypes);
  const grantedSet = new Set(grantedRecordTypes);
  const deniedRecordTypes = recordTypes.filter(recordType => !grantedSet.has(recordType));

  const results = await Promise.all(
    grantedRecordTypes.map(async recordType => {
      try {
        const response = await readHealthConnectRecordType(recordType, options);
        return {
          recordType,
          records: response.records,
          pageToken: response.pageToken,
        };
      } catch (error) {
        return {
          recordType,
          records: [],
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }),
  );

  return {
    grantedRecordTypes,
    deniedRecordTypes,
    results,
  };
}

export async function readSamsungHealthSyncedData(
  options: Omit<HealthConnectReadOptions, 'recordTypes'>,
): Promise<HealthConnectReadAllResult> {
  return readAllHealthConnectData({
    ...options,
    recordTypes: SAMSUNG_HEALTH_SYNC_RECORD_TYPES,
  });
}

function recordStartTime(record: any): string | undefined {
  return record?.startTime ?? record?.time;
}

function recordEndTime(record: any): string | undefined {
  return record?.endTime ?? recordStartTime(record);
}

function dataOrigin(record: any): string | undefined {
  return record?.metadata?.dataOrigin ?? record?.metadata?.dataOriginPackageName;
}

function numericValue(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  return undefined;
}

function durationMinutes(record: any): number | undefined {
  const start = recordStartTime(record);
  const end = recordEndTime(record);
  if (!start || !end) return undefined;
  const durationMs = new Date(end).getTime() - new Date(start).getTime();
  if (!Number.isFinite(durationMs) || durationMs <= 0) return undefined;
  return Math.round((durationMs / 60000) * 10) / 10;
}

function distanceKm(record: any): number | undefined {
  const meters =
    numericValue(record?.distance?.inMeters) ??
    numericValue(record?.distance) ??
    numericValue(record?.value);
  return meters == null ? undefined : Math.round((meters / 1000) * 1000) / 1000;
}

function calories(record: any): number | undefined {
  return (
    numericValue(record?.energy?.inKilocalories) ??
    numericValue(record?.energy) ??
    numericValue(record?.value)
  );
}

function sampleBase(
  type: string,
  record: any,
  value: number,
  unit: string,
  rawRecordType?: string,
): HealthMetricSampleRequest | null {
  const startTime = recordStartTime(record);
  if (!startTime) return null;

  return {
    type,
    value,
    unit,
    startTime,
    endTime: recordEndTime(record),
    source: 'health_connect',
    dataOrigin: dataOrigin(record),
    rawRecordType: rawRecordType ?? record?.exerciseType ?? type,
  };
}

function healthSamplesFromRecord(
  recordType: RecordType,
  record: any,
): HealthMetricSampleRequest[] {
  switch (recordType) {
    case 'ExerciseSession': {
      const value = durationMinutes(record);
      const sample = value == null
        ? null
        : sampleBase('ExerciseSession', record, value, 'minutes', record?.exerciseType);
      return sample ? [sample] : [];
    }
    case 'Steps': {
      const value = numericValue(record?.count);
      const sample = value == null ? null : sampleBase('Steps', record, value, 'count');
      return sample ? [sample] : [];
    }
    case 'Distance': {
      const value = distanceKm(record);
      const sample = value == null ? null : sampleBase('Distance', record, value, 'km');
      return sample ? [sample] : [];
    }
    case 'ActiveCaloriesBurned':
    case 'TotalCaloriesBurned': {
      const value = calories(record);
      const sample = value == null ? null : sampleBase(recordType, record, value, 'kcal');
      return sample ? [sample] : [];
    }
    case 'HeartRate':
      return (record?.samples ?? [])
        .map((sample: any) =>
          sampleBase(
            'HeartRate',
            { ...record, startTime: sample?.time, endTime: sample?.time },
            numericValue(sample?.beatsPerMinute) ?? Number.NaN,
            'bpm',
          ),
        )
        .filter(Boolean);
    case 'Speed':
      return (record?.samples ?? [])
        .map((sample: any) =>
          sampleBase(
            'Speed',
            { ...record, startTime: sample?.time, endTime: sample?.time },
            numericValue(sample?.speed?.inMetersPerSecond) ?? Number.NaN,
            'm/s',
          ),
        )
        .filter(Boolean);
    case 'Power':
      return (record?.samples ?? [])
        .map((sample: any) =>
          sampleBase(
            'Power',
            { ...record, startTime: sample?.time, endTime: sample?.time },
            numericValue(sample?.power?.inWatts) ?? Number.NaN,
            'W',
          ),
        )
        .filter(Boolean);
    default:
      return [];
  }
}

export async function readQuestVerificationHealthSamples(
  startTime: string | Date,
  endTime: string | Date = new Date(),
): Promise<QuestHealthSampleReadResult> {
  const result = await readAllHealthConnectData({
    startTime,
    endTime,
    recordTypes: QUEST_VERIFICATION_RECORD_TYPES,
  });

  const samples = result.results.flatMap(item =>
    item.records.flatMap(record => healthSamplesFromRecord(item.recordType, record)),
  );

  return {
    samples: samples.filter(sample => Number.isFinite(sample.value)),
    grantedRecordTypes: result.grantedRecordTypes,
    deniedRecordTypes: result.deniedRecordTypes,
  };
}
