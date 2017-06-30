const initialState = {};

export default function(req) {
	return Object.assign(
		{},
		initialState,
		{
			user: req.user
		});
}
