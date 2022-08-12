// can import all of the constants into this file and then import just this file from elsewhere

const contractAddresses = require("./contractAddresses.json")
const abi = require("./abi.json")

module.exports = {
    abi,
    contractAddresses,
}
