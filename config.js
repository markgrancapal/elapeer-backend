module.exports = {
	LOG_DIRECTORY:
		"/home/bon/var/elabox-crawler/logs",
	OUTPUT_DIRECTORY:
		"/home/bon/var/elabox-crawler/out",
	ELAPIER_OUTPUT_DIRECTORY:"/home/bon/var/elabox-crawler/out2",
	MONGODB_CONNECTION_STRING:
		"mongodb://localhost/upwork",
	DAYS_BEFORE_DELETE: 20,
	RETRY_COUNT: 5,
	RETRY_INTERVAL: 60, // minutes
	CRON_EXPRESSION: "0 0 * * *", // runs every day at 00:00
	TIMEZONE: "Asia/Kolkata", // refer moment.js timezone list
};
