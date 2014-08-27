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
			editCategory: 1<<8
		}
	}
}
