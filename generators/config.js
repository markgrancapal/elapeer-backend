module.exports = {
	LOG_DIRECTORY:
		"/home/maki/crawler_logs",
	OUTPUT_DIRECTORY:
		"/home/maki/elapeer-backend/generators/out",
	ELAPIER_OUTPUT_DIRECTORY:"/home/maki/elapeer-backend/server/data",
	MONGODB_CONNECTION_STRING:
		"mongodb://localhost/elapeer",
	DAYS_BEFORE_DELETE: 14,
	RETRY_COUNT: 5,
	RETRY_INTERVAL: 60, // minutes
	CRON_EXPRESSION: "0 0 * * *", // runs every day at 00:00
	TIMEZONE: "Asia/Kolkata", // refer moment.js timezone list
};
