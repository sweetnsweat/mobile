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
