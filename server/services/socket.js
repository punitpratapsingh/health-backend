import socketIO from 'socket.io';
import UserModel from '../schemas/user';
import ChannelModel from '../schemas/channel';
import MessageModel from '../schemas/message';
import ChannelToStaffModel from '../schemas/channelToStaff';
import { USER_TYPE, AMQP_QUEUES, NOTIFICATION_TYPE } from '../constants';

const updateUserSocketId = async (socketId, userId) => {
	try {
		const userUpdated = await UserModel.findByIdAndUpdate(
			{ _id: userId },
			{ socketId, online: true },
			{ new: true },
		);
		if (!userUpdated) {
			return ({ code: 400, message: 'Missing user ID for socket' });
		}
		const data = {
			message: `${userUpdated.firstName} ${userUpdated.lastName} is connected to ${socketId}.`,
		};
		return ({
			code: 200,
			data,
		});
	} catch (error) {
		console.log('Some error occured while connecing user from socket.');
		return ({ code: 400, message: error });
	}
};

const markUserOffline = async (socketId) => {
	try {
		const userUpdated = await UserModel.findOneAndUpdate(
			{ socketId },
			{ online: false },
			{ new: true },
		);
		if (!userUpdated) {
			return ({ code: 400, message: 'Missing user ID for socket' });
		}
		if (userUpdated.type === USER_TYPE.STAFF) {
			await ChannelToStaffModel.deleteOne({ staffRef: userUpdated._id });
		}
		return ({ code: 200, message: `User ${userUpdated.firstName} ${userUpdated.lastName} is offline now.` });
	} catch (error) {
		console.log('Some error occured while disconnecting user from socket.');
		return ({ code: 400, message: error });
	}
};

const broadcastAllusers = async (io) => {
	try {
		const users = await UserModel.find({});
		let message;
		users.forEach((user) => {
			if (user.online && user.socketId) {
				message = `Hi User ${user.firstName} ${user.lastName}.`;
				console.log(message);
				io.to(user.socketId).emit('broadcast message', { message, type: 2 });
			}
		});
		return ({ code: 200, message: 'Message broadcast done.' });
	} catch (error) {
		console.log('Some error occured while broadcasting message to users from socket.');
		return ({ code: 400, message: error });
	}
};

const makeEveryoneOffline = async () => {
	try {
		const userUpdated = await UserModel.updateMany(
			{ online: true },
			{ online: false },
			{ new: true },
		);
		if (!userUpdated) {
			return ({ code: 400, message: 'Missing user ID for socket' });
		}
		await ChannelModel.updateMany(
			{
			},
			{
				activeSession: false,
			},
		);
		return ({ code: 200, message: 'All users are now offline.' });
	} catch (error) {
		console.log('Some error occured while disconnecting all user from socket.');
		return ({ code: 400, message: error });
	}
};

/**
 * @description
 * To be handled while linking the staff with the user
 * the staff will be mapped to the user conversation that user is trying to
 * reply to. This will create a new ChannelToStaff object if it does not already exists
 * On successful completion, this subroutine will emit the "userConnected" event that will
 * return the channel id.
 * @param {*} socketId represents the socket id. could be derived from @params socket as well.
 * @param {*} data represents the id of the user to connect with
 * @param {*} io the socket.io instance
 */
const connectStaffToUser = async (socketId, data, io) => {
	try {
		const staff = await UserModel.findOne({ socketId, type: USER_TYPE.STAFF });
		if (!staff) {
			console.log('staff not found for socket id.');
			return ({ code: 400, message: 'staff not found for socket id.' });
		}
		const userActive = await UserModel.findOne({ _id: data });
		console.log(userActive);
		console.log(data);
		if (!userActive) {
			console.log(`User ${userActive.firstName} ${userActive.lastName} is offline.`);
			return ({
				code: 400, message: `User ${userActive.firstName} ${userActive.lastName} is offline.`,
			});
		}
		const userChannel = await ChannelModel.findOne({ userRef: data });
		if (!userChannel) {
			console.log('user does not have a channel');
			return ({
				code: 400, message: 'User does not have a channel.',
			});
		}
		const channelToStaff = await ChannelToStaffModel.findOne({
			channelRef: userChannel._id,
			staffRef: staff._id,
		});
		if (!channelToStaff) {
			console.log('creating new channel to staff mapping');
			const ChannelToStaffObject = new ChannelToStaffModel({
				channelRef: userChannel._id,
				staffRef: staff._id,
				createdOn: new Date(),
				updatedOn: new Date(),
			});
			await ChannelToStaffObject.save();
		}
		console.log('connected staff to user');
		io.to(socketId).emit('userConnected', userChannel._id);
		return ({ code: 200, message: 'Connected staff to user.' });
	} catch (error) {
		console.log(error);
		console.log('Some error occured while connecting staff to user.');
		return ({ code: 400, message: error });
	}
};

const messageService = async (socketId, message, io, AMQPChannel) => {
	try {
		if (!message) {
			return ({ code: 400, message: 'Cannot send an empty message.' });
		}
		const messageUser = await UserModel.findOne({ socketId });
		if (!messageUser) {
			return ({ code: 400, message: 'staff not found for socket id.' });
		}
		let user;
		let channel;
		if (messageUser.type === USER_TYPE.STAFF) {
			const channelToStaff = await ChannelToStaffModel.findOne({ staffRef: messageUser._id });
			channel = await ChannelModel.findOne({ _id: channelToStaff.channelRef });
			user = await UserModel.findOne({ _id: channel.userRef });
		} else if (messageUser.type === USER_TYPE.USER) {
			channel = await ChannelModel.findOne({ userRef: messageUser._id });
			user = messageUser;
		}
		if (!channel) {
			return ({ code: 400, message: 'channel not found for socket id.' });
		}
		const staffRef = await ChannelToStaffModel.find({ channelRef: channel._id });
		const staffDataPromise = [];
		staffRef.forEach((element) => {
			staffDataPromise.push(UserModel.findOne({ _id: element.staffRef }));
		});
		const staff = await Promise.all(staffDataPromise);
		const timeStamp = new Date().getTime();
		const MessageObject = new MessageModel({
			userRef: messageUser._id,
			channelRef: channel._id,
			message,
			createdOn: timeStamp,
			updatedOn: timeStamp,
		});
		const data = {
			message,
			messageId: MessageObject._id,
			name: `${messageUser.firstName} ${messageUser.lastName}`,
			userId: messageUser._id,
			userType: messageUser.type,
			timeStamp,
			type: 1,
			read: false,
		};

		io.to(user.socketId).emit('message', { data });
		if (!user.online) {
			AMQPChannel.sendToQueue(
				AMQP_QUEUES.NOTIFICATION,
				Buffer.from(JSON.stringify({
					fcmToken: user.fcmToken,
					device: user.device,
					ref: MessageObject._id,
					subtitle: message,
					title: `${messageUser.firstName} ${messageUser.lastName}`,
					type: NOTIFICATION_TYPE.MESSAGE,
					picture: messageUser.picture,
				})),
			);
		}
		// const chatPromises = [];
		staff.forEach((element) => {
			io.to(element.socketId).emit('message', { data });
		});
		// Promise.all(chatPromises);
		MessageObject.save();
	} catch (error) {
		console.log(error);
		console.log('Some error occured while sending messages.');
		return ({ code: 400, message: error });
	}
};

const messageReadService = async (messageId, _io) => {
	try {
		await MessageModel.findOneAndUpdate({ _id: messageId }, { read: true });
	} catch (error) {
		console.log(error);
		console.log('Some error occured while sending messages.');
		return ({ code: 400, message: error });
	}
};

const messageReadAllService = async () => {
	//
};

let io;
const startSocket = (server,
	AMQPChannel,
	AMQPConnection) => new Promise(async (resolve, reject) => {
	try {
		io = socketIO(server); // initializing socket
		console.log('Socket Server Started.');
		makeEveryoneOffline();
		io.on('connection', async (socket) => {
			console.log('###########################');
			console.log(socket.id);
			console.log(socket.handshake.query);
			console.log('###########################');
			const { handshake: { query: { userId } } } = socket;
			// const userId = socket.handshake.query.userId;
			const online = await updateUserSocketId(socket.id, userId);
			// socket.emit('event', online);
			io.to(socket.id).emit('event', online);
			// saving user's socketId and online state after each connection
			// cron.schedule('*/10 * * * * *', () => {
			// 	console.log('running a task every minute');
			// 	broadcastAllusers(io);
			// });
			socket.on('disconnect', async () => {
				await markUserOffline(socket.id); // handling user's connection break
			});
			socket.on('connectUser', async (data) => {
				console.log('===============>', data);
				const connectChannel = await connectStaffToUser(socket.id, data, io);
				io.to(socket.id).emit('message', connectChannel.message);
			});
			socket.on('message', async (message) => {
				console.log('``````````````````````');
				console.log(message);
				console.log('``````````````````````');
				message = message.trim();
				if (message.length) {
					await messageService(socket.id, message, io, AMQPChannel); // handling user's messages
				}
			});
			socket.on('messageRead', async (messageId, _io) => {
				await messageReadService(messageId);
			});
			// socket.on('messageReadAll', async (messageId) => {
			// 	await messageReadAllService(messageId); // handling user's messages
			// });
		});
	} catch (err) {
		return ('Some error occured while initializing socket.');
	}
});

export default {
	startSocket,
};
