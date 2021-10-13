const path = require("path");
const mongoose = require("mongoose");
const cron = require("node-cron");

const Log = require("./schema/logSchema");

const {
	MONGODB_CONNECTION_STRING,
	DAYS_BEFORE_DELETE,
	CRON_EXPRESSION,
	TIMEZONE,
	RETRY_COUNT,
	RETRY_INTERVAL,
	LOG_DIRECTORY,
	OUTPUT_DIRECTORY,
	ELAPIER_OUTPUT_DIRECTORY
} = require("./config");

const {
	deleteOlderLogs,
	saveLogs,
	readFiles,
	getFormatedLogsData,
	getStatsData,
	getCityNodesData,
	saveDataToFile,
	copyResultToServer
} = require("./functions");

const { getPreviousDate, executeWithRetry } = require("./utils");

function main() {
	mongoose.connect(MONGODB_CONNECTION_STRING, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	mongoose.connection.on("error", (err) => {
		console.log(err);
	});

	mongoose.connection.on("open", async () => {
		console.log("connected to mongodb database");

		try {
			const previousDate = getPreviousDate(); // yyyy-mm-dd
			const currentLogDirectory = path.join(LOG_DIRECTORY, previousDate);

			const files = readFiles(currentLogDirectory);
			const data = getFormatedLogsData(files);

			await saveLogs(data);
			console.log("successfully saved data to database");

			const { deletedCount } = await deleteOlderLogs(DAYS_BEFORE_DELETE);
			console.log(`successfully deleted ${deletedCount} older logs`);

			const { cityNodes, missingCities } = await getCityNodesData();
			const { filepath: cityNodesFilePath } = saveDataToFile(
				cityNodes,
				OUTPUT_DIRECTORY,
				"citynodescount.json"
			);
			console.log(`saved citynodescount.json at ${cityNodesFilePath}`);
			
			const { filepath: missingCitiesFilePath } = saveDataToFile(
				missingCities,
				OUTPUT_DIRECTORY,
				"missingcities.json"
			);
			console.log(`saved missingcities.json at ${missingCitiesFilePath}`);

			const statsData = await getStatsData();
			const { filepath: statsFilePath } = saveDataToFile(
				statsData,
				OUTPUT_DIRECTORY,
				"stats.json"
			);
			console.log(`saved stats.json at ${statsFilePath}`);
			
			//Copy  file into server

			const { filepath: cityNodesServerFilePath }= copyResultToServer(cityNodesFilePath,ELAPIER_OUTPUT_DIRECTORY,"citynodescount.json")
			console.log(`copied latest citynodescount.json at ${cityNodesServerFilePath}`);

			const { filepath: statsServerFilePath } = copyResultToServer(
				statsFilePath,
				ELAPIER_OUTPUT_DIRECTORY,				
				"stats.json"
			);
			console.log(`copied latest stats.json at ${statsServerFilePath}`);
		} catch (err) {
			console.log(err);
			throw err;
		}
		finally{
			mongoose.connection.close(() =>
				console.log("database connection is closed")
			);
		}
	});
}

main();

cron.schedule(
	CRON_EXPRESSION,
	() => {
		executeWithRetry(main, RETRY_COUNT, RETRY_INTERVAL);
	},
	{ timezone: TIMEZONE }
);
