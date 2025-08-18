const DbMixin = require("../mixins/db.mixin");
const bcrypt = require("bcryptjs");

module.exports = {
	name: "auth",
	mixins: [DbMixin("users")],

	settings: {
		fields: {
			_id: { type: "string", primaryKey: true, columnName: "_id" },
			username: { type: "string", required: true },
			password: { type: "string", required: true },
			createdAt: { type: "number", onCreate: () => Date.now() }
		},

		entityValidator: {
			username: { type: "string", min: 3 },
			password: { type: "string", min: 4 }
		}
	},

	actions: {
		validateUser: {
			params: {
				username: { type: "string" },
				password: { type: "string" }
			},
			async handler(ctx) {
				const { username, password } = ctx.params;
				
				let user = await this.adapter.findOne({ username });
				
				if (!user) {
					const hashedPassword = await bcrypt.hash(password, 10);
					user = await this.adapter.insert({
						username,
						password: hashedPassword,
						createdAt: Date.now()
					});
					return { 
						id: user._id.toString(), // Asegurarse de que el ID es string
						username: user.username 
					};
				}
				
				const isValid = await bcrypt.compare(password, user.password);
				
				if (!isValid) {
					return null;
				}
				
				return { 
					id: user._id.toString(), // Asegurarse de que el ID es string
					username: user.username 
				};
			}
		}
	},

	methods: {},

	async started() {
		const adminExists = await this.adapter.findOne({ username: "admin" });
		if (!adminExists) {
			const hashedPassword = await bcrypt.hash("admin123", 10);
			await this.adapter.insert({
				username: "admin",
				password: hashedPassword,
				createdAt: Date.now()
			});
			this.logger.info("Default admin user created (username: admin, password: admin123)");
		}
	}
};