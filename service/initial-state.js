const initialState = {
	AlertStore: {
		alertVisible: false
	},
	UserStore: {}
};

export default function(req) {
	return Object.assign(
		{},
		initialState,
		{
			UserStore: {
				currentUser: req.user
			}
		});
}
