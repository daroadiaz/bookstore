const DbService = require("moleculer-db");
const MongoAdapter = require("moleculer-db-adapter-mongo");

module.exports = function(collection) {
	const schema = {
		mixins: [DbService],
		adapter: new MongoAdapter("mongodb://127.0.0.1:27017/bookstore_db", {
			useNewUrlParser: true,
			useUnifiedTopology: true
		}),
		collection,
		
		methods: {
			async seedDB() {
				this.logger.info(`Seeding ${collection} collection...`);
			}
		},

		async afterConnected() {
			this.logger.info(`Connected to ${collection} collection`);
		}
	};

	return schema;
};