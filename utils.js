const fs = require("fs");
const path = require("path");

const domainsFilePath = path.join(__dirname, "data", "domain.json");
const domains = fs.readFileSync(domainsFilePath, "utf8");
const domainsArr = JSON.parse(domains);

const citiesFilePath = path.join(__dirname, "data", "cities.json");
const cities = fs.readFileSync(citiesFilePath, "utf8");
const citiesArr = JSON.parse(cities);

module.exports.getLatlng = (country, city) => {
	try {
		const countryNode = domainsArr.find((row) => row.country === country);

		if (!countryNode) return null;

		const countryCode = countryNode.tld.substr(1).toUpperCase();
		const cityNode = citiesArr.find(
			(row) => row.country === countryCode && row.name === city
		);

		if (!cityNode) {
			return {
				lat: "not available",
				lng: "not available",
			};
		}

		return {
			lat: cityNode.lat,
			lng: cityNode.lng,
		};
	} catch (err) {
		throw err;
	}
};

module.exports.getPreviousDate = () => {
	const today = new Date();
	const currentYear = today.getFullYear();
	const currentMonth = today.getMonth();
	const currentDate = today.getDate();

	const previousDay = new Date(
		new Date(currentYear, currentMonth, currentDate).getTime() -
			1000 * 60 * 60 * 24
	);

	let dd = previousDay.getDate();
	let mm = previousDay.getMonth() + 1;
	const yyyy = previousDay.getFullYear();

	if (dd < 10) dd = `0${dd}`;

	if (mm < 10) mm = `0${mm}`;

	return `${yyyy}-${mm}-${dd}`;
};

module.exports.executeWithRetry = (func, retryCount, interval) => {
	let count = 0;

	const execute = async () => {
		count++;

		try {
			await func();
		} catch (err) {
			if (count <= retryCount) {
				console.log(
					`${new Date().toUTCString()}, Retry: ${count}/${retryCount}`
				);
				if (interval) {
					setTimeout(execute, 1000 * 60 * interval);
				} else {
					execute();
				}
			}
		}
	};

	execute();
};
