module.exports = {
	UserGroup: {
		permissions: {
			// Can log in in admin menu
			adminLogin: 1,
			// can add content, articles, menus etc.
			addContent: 1<<1,
			// can edit content, articles, menus etc.
			editContent: 1<<2,
			// can delete content, articles, menus etc.
			deleteContent: 1<<3,
			// TODO: add/edit/delete permissions are not necessary,
			// only editUser permission that covers all three
			// should be enough.
			// can add users
			addUser: 1<<4,
			// can edit users
			editUser: 1<<5,
			// can delete users
			deleteUser: 1<<6,
			// can add/edit/delete user groups
			// this is being super admin since adding/editing
			// user groups means altering permissions
			superAdmin: 1<<7,
			// Can add/edit/delete categories
			editCategory: 1<<8,
			// Can add/edit/delete menus
			editMenu: 1<<9
		}
	},
	Menu: {
		types: {
			// menu displays a static, single article
			// data.article is Article _id.
			singleArticle: 1,
			// menu displays a page similar to homepage but
			// the articles are of the given category or its descendants only.
			// data.category is Category _id.
			category: 2
		}
	},
	SubContent: {
		// WARNING: This must be synced with key 'admin.subcontenttypes.key' in translation file!
		types: {
			// A static text defined in data.text, in html format
			text: 1,
			// An image defined in data.image
			image: 2,
			// A menu defined in data.menu rendered with data.template
			menu: 3,
			// A menu defined in data.menu rendered with data.template
			article: 4,
			// A menu defined in data.menu rendered with data.template
			articleList: 5
		}
	}
}
