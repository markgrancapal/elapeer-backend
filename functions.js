const fs = require("fs");
const path = require("path");
const Log = require("./schema/logSchema");
const { getPreviousDate, getLatlng } = require("./utils");

module.exports.deleteOlderLogs = (days) => {
	console.log("deleting older logs...");
	return new Promise(async (resolve, reject) => {
		try {
			const { deletedCount } = await Log.deleteMany({
				timestamp: {
					$lt: new Date(Date.now() - 1000 * 60 * 60 * 24 * days).toISOString(),
				},
			});

			resolve({ deletedCount });
		} catch (err) {
			reject(err);
		}
	});
};

module.exports.saveLogs = (data) => {
	console.log(
		"saving logs to database, it may take a couple of minutes, please wait..."
	);
	return new Promise(async (resolve, reject) => {
		try {
			await Log.bulkWrite(
				data.map((log) => ({
					updateOne: {
						filter: { logId: log.logId },
						update: { $set: log },
						upsert: true,
					},
				}))
			);

			resolve();
		} catch (err) {
			reject(err);
		}
	});
};

module.exports.readFiles = (directory) => {
	console.log("reading log files...");
	try {
		const fileNames = fs.readdirSync(directory);
		const files = fileNames.map((fileName) => path.join(directory, fileName));
		return files;
	} catch (err) {
		throw err;
	}
};

module.exports.getFormatedLogsData = (files) => {
	let logData = [];
	const timestamp = new Date().toISOString();

	try {
		files.forEach((file) => {
			let data = fs.readFileSync(file, "utf8");
			data = data.trim().split("\n");

			data = data.map((row) => {
				col = row.split(", ");

				return {
					logId: col[0],
					ip: col[1],
					country: col[2],
					city: col[3],
					state: col[4],
					timestamp,
				};
			});

			logData = logData.concat(data);
		});

		return logData;
	} catch (err) {
		throw err;
	}
};

module.exports.getStatsData = () => {
	return new Promise(async (resolve, reject) => {
		try {
			let total = 0;

			const data = await Log.aggregate([
				{
					$group: {
						_id: { country: "$country" },
						count: { $sum: 1 },
					},
				},
				{ $sort: { "_id.country": 1 } },
			]);

			const countryNodes = data.map((row) => ({
				name: row._id.country,
				count: row.count,
			}));

			countryNodes.forEach((node) => (total += node.count));

			resolve([
				{
					total,
					countryNodes,
				},
			]);
		} catch (err) {
			reject(err);
		}
	});
};

module.exports.getCityNodesData = () => {
	return new Promise(async (resolve, reject) => {
		try {
			const data = await Log.aggregate([
				{
					$group: {
						_id: {
							country: "$country",
							city: "$city",
						},
						city: { $first: "$city" },
						count: { $sum: 1 },
					},
				},
				{ $sort: { "_id.country": 1, "_id.city": 1 } },
			]);

			const cityNodes = [];
			const missingCities = [];

			data.forEach((row) => {
				const corodinates = getLatlng(row._id.country, row._id.city);

				if (!corodinates) {
					const findCity = missingCities.find(
						(item) =>
							item.country === row._id.country && item.city === row._id.city
					);

					if (!findCity) {
						missingCities.push({
							country: row._id.country,
							city: row._id.city,
						});
					}
				}

				const lat = corodinates ? corodinates.lat : "not found";
				const lng = corodinates ? corodinates.lng : "not found";

				const node = {
					country: row._id.country,
					city: row._id.city,
					lat,
					lng,
					count: row.count,
				};

				cityNodes.push(node);
			});

			resolve({ cityNodes, missingCities });
		} catch (err) {
			reject(err);
		}
	});
};

module.exports.saveDataToFile = (data, directory, filename) => {
	const previousDate = getPreviousDate(); // yyyy-mm-dd
	const filepath = path.join(directory, `${previousDate}-${filename}`);
	try {
		fs.writeFileSync(filepath, JSON.stringify(data, null, 2), "utf8");
		return { filepath };
	} catch (err) {
		throw err;
	}
};

module.exports.copyResultToServer=(src,directory,filename)=>{
	try {
		const filepath = path.join(directory,filename)
		fs.copyFileSync(src,filepath)
		return {filepath}		
	} catch (err) {
		throw err;		
	}
}