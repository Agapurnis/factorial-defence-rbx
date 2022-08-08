export const enum GenericError {
	/**
	 * A resource or one of it's assosciates was not found.
	 */
	NOT_FOUND = "NOT_FOUND",
	/**
	 * This operation is (likely) valid, but is not allowed.
	 */
	FORBIDDEN = "FORBIDDEN",
	/**
	 * An unknown internal server error occured.
	 */
	UNKNOWN_INTERNAL_SERVER_ERROR = "UNKNOWN"
}
