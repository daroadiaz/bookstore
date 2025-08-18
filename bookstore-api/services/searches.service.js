const DbMixin = require("../mixins/db.mixin");

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

				const existingSearch = await this.adapter.findOne({
					userId: userIdStr,
					query: query
				});

				if (!existingSearch) {
					await this.adapter.insert({
						userId: userIdStr,
						query,
						timestamp: Date.now()
					});
				} else {
					await this.adapter.updateById(existingSearch._id, {
						$set: { timestamp: Date.now() }
					});
				}

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
					searches: searches.map(s => s.query)
				};
			}
		}
	}
};