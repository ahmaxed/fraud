require("dotenv").config();
const fs = require("fs");
var stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

let mod = require("./charges.js");
let array = mod.array;
let sucessFile = "refunds.txt";
let errorFile = "refunds-error.txt";

const wait = seconds => {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log("waiting...");
      resolve(seconds);
    }, seconds * 1000);
  });
};

async function asyncForEach(inputArray, callback) {
  for (let index = 0; index < inputArray.length; index++) {
    await wait(2);
    await callback(inputArray[index], index, inputArray);
  }
}

// asyn await and 2 seconds for each call
asyncForEach(array, (item, i) => {
  stripe.refunds.create({ charge: item }, function(err, refund) {
    if (err) {
      const { message } = err;
      console.log(message);
      write(errorFile, JSON.stringify({ item: err }));
    } else {
      const { balance_transaction, charge, amount, status } = refund;
      console.log(
        "Refunded: " +
          balance_transaction +
          " for charge: " +
          charge +
          " with amount: " +
          amount +
          " and status: " +
          status
      );
      write(sucessFile, JSON.stringify(refund));
    }
  });
  if (i % 100 == 0) console.log((i / array.length).toFixed(2) + " completed");
});

function write(file, item) {
  fs.appendFile(file, item, function(err) {
    if (err) console.log(item + "write Error!");
  });
}
