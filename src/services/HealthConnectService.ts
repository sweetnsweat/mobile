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
import { Platform } from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { getStoredAuth } from './AuthService';

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

export const HEALTH_DATA_SYNC_RECORD_TYPES: RecordType[] = [
  'Steps',
  'Distance',
  'ActiveCaloriesBurned',
  'ExerciseSession',
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

export interface HealthDataSyncRequest {
  samples: HealthMetricSampleRequest[];
}

export interface HealthDataSyncResponse {
  syncedSampleCount?: number;
  [key: string]: unknown;
}

export interface HealthDataSyncResult {
  response: HealthDataSyncResponse | null;
  sampleCount: number;
  grantedRecordTypes: RecordType[];
  deniedRecordTypes: RecordType[];
  skipped: boolean;
  reason?: string;
}

export interface SyncHealthDataOptions {
  days?: number;
  force?: boolean;
  staleMs?: number;
}

const DEFAULT_SYNC_DAYS = 30;
const DEFAULT_SYNC_STALE_MS = 30 * 60 * 1000;
let lastHealthDataSyncAt = 0;
let healthDataSyncInFlight: Promise<HealthDataSyncResult> | null = null;

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

function authHeader(): Record<string, string> {
  const auth = getStoredAuth();
  if (!auth?.accessToken) throw new Error('로그인이 필요합니다.');
  return { Authorization: `Bearer ${auth.accessToken}` };
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

function distanceMeters(record: any): number | undefined {
  return (
    numericValue(record?.distance?.inMeters) ??
    numericValue(record?.distance) ??
    numericValue(record?.value)
  );
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

function healthDataSyncSamplesFromRecord(
  recordType: RecordType,
  record: any,
): HealthMetricSampleRequest[] {
  switch (recordType) {
    case 'ExerciseSession': {
      const value = durationMinutes(record);
      const sample = value == null
        ? null
        : sampleBase('ExerciseSession', record, value, 'minutes', 'ExerciseSession');
      return sample ? [sample] : [];
    }
    case 'Steps': {
      const value = numericValue(record?.count);
      const sample = value == null ? null : sampleBase('Steps', record, value, 'count', 'Steps');
      return sample ? [sample] : [];
    }
    case 'Distance': {
      const value = distanceMeters(record);
      const sample = value == null ? null : sampleBase('Distance', record, value, 'm', 'Distance');
      return sample ? [sample] : [];
    }
    case 'ActiveCaloriesBurned': {
      const value = calories(record);
      const sample = value == null ? null : sampleBase('ActiveCaloriesBurned', record, value, 'kcal', 'ActiveCaloriesBurned');
      return sample ? [sample] : [];
    }
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

export async function syncHealthDataWithServer(
  options: SyncHealthDataOptions = {},
): Promise<HealthDataSyncResult> {
  if (Platform.OS !== 'android') {
    return {
      response: null,
      sampleCount: 0,
      grantedRecordTypes: [],
      deniedRecordTypes: [],
      skipped: true,
      reason: 'unsupported_platform',
    };
  }

  const now = Date.now();
  const staleMs = options.staleMs ?? DEFAULT_SYNC_STALE_MS;
  if (!options.force && lastHealthDataSyncAt > 0 && now - lastHealthDataSyncAt < staleMs) {
    return {
      response: null,
      sampleCount: 0,
      grantedRecordTypes: [],
      deniedRecordTypes: [],
      skipped: true,
      reason: 'fresh',
    };
  }

  if (healthDataSyncInFlight) return healthDataSyncInFlight;

  healthDataSyncInFlight = (async () => {
    const endTime = new Date();
    const startTime = new Date(endTime);
    startTime.setDate(startTime.getDate() - (options.days ?? DEFAULT_SYNC_DAYS));

    const result = await readAllHealthConnectData({
      startTime,
      endTime,
      recordTypes: HEALTH_DATA_SYNC_RECORD_TYPES,
    });

    const samples = result.results
      .flatMap(item =>
        item.records.flatMap(record => healthDataSyncSamplesFromRecord(item.recordType, record)),
      )
      .filter(sample => Number.isFinite(sample.value));

    if (samples.length === 0) {
      lastHealthDataSyncAt = Date.now();
      return {
        response: null,
        sampleCount: 0,
        grantedRecordTypes: result.grantedRecordTypes,
        deniedRecordTypes: result.deniedRecordTypes,
        skipped: true,
        reason: 'no_samples',
      };
    }

    const res = await axios.post<{ data: HealthDataSyncResponse }>(
      `${API_BASE_URL}/health-data/sync`,
      { samples } satisfies HealthDataSyncRequest,
      { headers: authHeader() },
    );

    lastHealthDataSyncAt = Date.now();
    return {
      response: res.data.data,
      sampleCount: samples.length,
      grantedRecordTypes: result.grantedRecordTypes,
      deniedRecordTypes: result.deniedRecordTypes,
      skipped: false,
    };
  })();

  try {
    return await healthDataSyncInFlight;
  } finally {
    healthDataSyncInFlight = null;
  }
}

export async function syncHealthDataWithServerIfStale(
  options: Omit<SyncHealthDataOptions, 'force'> = {},
): Promise<HealthDataSyncResult> {
  return syncHealthDataWithServer({ ...options, force: false });
}
