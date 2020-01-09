require("dotenv").config();
const fs = require("fs");
var stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

let mod = require("./subscriptions.js");
let array = mod.array;
let sucessFile = "unsubscriptions.txt";
let errorFile = "unsubscriptions-error.txt";

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

asyncForEach(array, (item, i) => {
  stripe.subscriptions.del(item, function(err, confirmation) {
    if (err) {
      const { message } = err;
      console.log(message);
      write(errorFile, JSON.stringify({ item: err }));
    } else {
      const { plan, status } = confirmation;
      console.log(
        "Refunded: " +
          item +
          " for interval: " +
          plan.interval +
          " with amount: " +
          plan.amount +
          " and status: " +
          status
      );
      write(sucessFile, JSON.stringify(confirmation));
    }
  });
  if (i % 100 == 0) console.log((i / array.length).toFixed(2) + " completed");
});

function write(file, item) {
  fs.appendFile(file, item, function(err) {
    if (err) console.log(item + "write Error!");
  });
}
