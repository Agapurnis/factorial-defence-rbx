/**
 * UTC-*millisecond* timestamp of approximately when this server was created.
 *
 * This is used to prevent users with updated schemas somehow joining an outdated server.
 */
export const ServerCreatedTimestamp = DateTime.now().UnixTimestampMillis;
