const aggregationQuery = [
    {
        $match: { deleted: false },
    },
    {
        $lookup: {
            from: 'users',
            localField: 'userRef',
            foreignField: '_id',
            as: 'users',

        },
        {
            $unwind: {
                 path: '$users',
                 nullAndEmptyArray: true,
            },
        },
        {
            $project: {
                name: 'users.name',
                message: '$message',

            },
        },
        {
            $sort: -1,
        },
    },
];

const data = await CommentModel.aggregate(aggregationQuery);