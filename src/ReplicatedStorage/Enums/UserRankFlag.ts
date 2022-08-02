export const enum UserRankFlag {
	/**
	 * The owner of the game.
	 */
	OWNER = "OWNER",
	/**
	 * A maintainer of the GitHub repository.
	 */
	DEVELOPER = "DEVELOPER",
	/**
	 * A user who helps by contributing to the project on GitHub.
	 */
	CONTRIBUTOR = "CONTRIBUTOR",
	/**
	 * A user who has administrative privileges.
	 */
	ADMINISTRATOR = "ADMINISTRATOR",
	/**
	 * A user who has moderation privileges.
	 */
	MODERATOR = "MODERATOR",
	/**
	 * A user who has contributed models/builds to the project.
	 */
	BUILDER = "BUILDER",
	/**
	 * A user who is trusted or has been in the community for a long time.
	 */
	TRUSTED = "TRUSTED",
	/**
	 * A user who played during the testing phase.
	 */
	TESTER = "TESTER",
}
