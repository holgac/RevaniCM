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
		}
	}
}
