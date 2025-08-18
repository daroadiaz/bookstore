const DbMixin = require("../mixins/db.mixin");
const { ObjectId } = require("mongodb");

module.exports = {
	name: "searches",
	mixins: [DbMixin("searches")],

	settings: {
		fields: {
			_id: { type: "string", primaryKey: true, columnName: "_id" },
			userId: { type: "string", required: true },
			query: { type: "string", required: true },
			timestamp: { type: "number", onCreate: () => Date.now() }
		}
	},

	actions: {
		saveSearch: {
			params: {
				userId: { type: "string" },
				query: { type: "string" }
			},
			async handler(ctx) {
				const { userId, query } = ctx.params;

				const userIdStr = userId.toString();

				await this.adapter.insert({
					userId: userIdStr,
					query,
					timestamp: Date.now()
				});

				return { success: true };
			}
		},

		getLastSearches: {
			params: {
				userId: { type: "string" }
			},
			async handler(ctx) {
				const { userId } = ctx.params;

				const userIdStr = userId.toString();

				const searches = await this.adapter.find({
					query: { userId: userIdStr },
					sort: { timestamp: -1 },
					limit: 5
				});

				return {
					success: true,
					searches: searches.map(s => ({
						query: s.query,
						timestamp: s.timestamp
					}))
				};
			}
		}
	}
};