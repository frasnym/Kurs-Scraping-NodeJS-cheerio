const request = require("request");
const cheerio = require("cheerio");
const chalk = require("chalk");
const fs = require("fs");

let url = "https://kursdollar.org/"; // url to crawl

let kurs = [];
let tempKurs = [];

request(url, function (err, res, body) {
	if (err && res.statusCode !== 200) throw err;

	let $ = cheerio.load(body);
	$("table.in_table")
		.first() // find first table
		.find("tr") // find tr each
		.each((trIndex, trValue) => {
			if (!$(trValue).hasClass("title_table")) {
				// excludes title content
				$(trValue)
					.find("td")
					.each((tdIndex, tdValue) => {
						if (tdIndex === 0) {
							// index 0 is the currency
							tempKurs["symbol"] = $(tdValue).find("font").text(); // get symbol up or down
							tempKurs["cur"] = $(tdValue)
								.text()
								.replace(tempKurs["symbol"], "") // extract currency only
								.trim(); // remove whitespace before & after
							if (tempKurs["symbol"] === "")
								tempKurs["symbol"] = "-"; // handle kurs that not moving
						}
						if (tdIndex === 1) {
							// index 1 is the buy
							tempKurs["beli"] = $(tdValue).text().split(" ")[0];
						}
						if (tdIndex === 2) {
							// index 2 is the sell
							tempKurs["jual"] = $(tdValue).text().split(" ")[0];
						}

						// print to console
						if ($(tdValue).text().includes("↑")) {
							return process.stdout.write(
								chalk.green($(tdValue).text()) + "\t"
							);
						} else if ($(tdValue).text().includes("↓")) {
							return process.stdout.write(
								chalk.red($(tdValue).text()) + "\t"
							);
						}
						return process.stdout.write($(tdValue).text() + "\t");
					});
				process.stdout.write("\n");

				if (tempKurs["cur"].length === 3) {
					// check valid kurs, 3 digit
					kurs.push(tempKurs);
				}
				tempKurs = {}; // reset value
			}
		});

	console.log(kurs);

	// write to file
	fs.writeFile("output.json", JSON.stringify(kurs), (err) => {
		if (err) throw err;
		console.log("The file has been saved!");
	});
});
