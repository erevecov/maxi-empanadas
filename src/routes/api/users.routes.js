import User from '../../models/User'

export default [
    {
        method: 'GET',
        path: '/api/users',
        options: {
            description: 'get all users',
            notes: 'get all users',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let findUsers = await User.find({}, ['name'])

                    return findUsers
                } catch (error) {
                    console.log(error)

                    return h.response({
                        error: 'Internal Server Error'
                    }).code(500)
                }
            }
        }
    },
]