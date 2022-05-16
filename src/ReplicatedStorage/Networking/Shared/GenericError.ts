export const enum GenericError {
	/**
	 * An unknown internal error occured.
	 */
	UnknownInternalServiceError = "UnknownInternalServiceError",
	/**
	 * There was an issue regarding the retrieval or persistance of any assosciated data.
	 */
	DataStoreFailure = "DataStoreFailure",
	/**
	 * The asset that was attempted to be created has already been made.
	 */
	AlreadyExists = "AlreadyExists",
	/**
	 * The user is not authorized to preform this action.
	 */
	Forbidden = "Forbidden",
	/**
	 * The requested resource (or an associated resource) was not found
	 */
	NotFound = "NotFound",
	/**
	 * The request was rejected for attempting to preform an action deemed "invalid".
	 *
	 * This is *usually* (but **not always**) indicative of a user attempting to exploit, but it may occur during normal gameplay.
	 */
	Invalid = "Invalid",
}
