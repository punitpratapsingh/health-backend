export default (req, res, next) => {
	const {
		files, body: {
			data, id, AMQPConnection, AMQPChannel,
		},
	} = req;
	req.body = data ? Object.assign({}, JSON.parse(data), { AMQPConnection, AMQPChannel }) : { AMQPConnection, AMQPChannel };
	if (id) {
		req.body.id = id;
	}
	if (files && Object.keys(files).length) {
		Object.keys(files).map((fileKey) => {
			req.body[fileKey] = files[fileKey].data;
		});
	}
	return next();
};
