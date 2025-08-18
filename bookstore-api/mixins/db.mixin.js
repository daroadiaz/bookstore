"use strict";

const DbService = require("moleculer-db");
const MongoAdapter = require("moleculer-db-adapter-mongo");

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://admin:admin123@mongodb:27017/bookstore_db?authSource=admin";

module.exports = function (collection) {
  return {
    mixins: [DbService],
    adapter: new MongoAdapter(MONGO_URI),
    collection,

    methods: {
      async seedDB() {
        this.logger.info(`Seeding ${collection} collection...`);
      }
    },

    afterConnected() {
      this.logger.info(`Connected to ${collection} collection`);
    }
  };
};
