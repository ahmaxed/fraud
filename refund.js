require("dotenv").config();
const fs = require("fs");
var stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

let mod = require("./charges.js");
let array = mod.array;
let sucessFile = "refunds.txt";
let errorFile = "refunds-error.txt";

array.map((item, i) => {
  stripe.refunds.create({ charge: item }, function(err, refund) {
    if (err) write(errorFile, JSON.stringify({ item: err }));
    else write(sucessFile, JSON.stringify(refund));
  });
  if (i % 100 == 0) console.log((i / array.length).toFixed(2) + " completed");
});

function write(file, item) {
  fs.appendFile(file, item, function(err) {
    if (err) console.log(item + "write Error!");
  });
}
