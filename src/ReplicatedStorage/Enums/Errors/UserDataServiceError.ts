export enum UserDataServiceError {
	/**
	 * An unknown issue occured trying to interact with the DataStore servers.
	 */
	DATA_STORE_FAILURE = "DATA_STORE_FAILURE",
	/**
	 * The user attempted to save/write within a cooldown period.
	 */
	COOLDOWN = "COOLDOWN",
	/**
	 * An attempt was made to save in studio when it was disabled and mocking was not enabled.
	 */
	SAVING_IN_STUDIO_DISABLED_WHEN_NOT_MOCKING = "SAVING_IN_STUDIO_DISABLED_WHEN_NOT_MOCKING",
}
