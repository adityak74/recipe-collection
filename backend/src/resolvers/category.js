export default {
	Query: {
		category: (parent, args, ctx) => ctx.prisma.category({ id: args.id }),
		categories: (parent, args, ctx) => ctx.prisma.categories(),
	},

	Mutation: {
		createCategory: async (parent, args, ctx) => {
			console.log('createCategory');
			const category = await ctx.prisma.createCategory({ data: { ...args } });
			console.log(category);
			return category;
		},

		deleteCategory: async () => {
			console.log('deleteCategory');
			// TODO
		},

		updateCategory: async () => {
			console.log('updateCategory');
			// TODO
		},
	},
};
