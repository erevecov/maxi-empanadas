import dotenv from 'dotenv'

dotenv.config()

export default {
    method: ['GET'],
    path: '/informes',
    options: {
        auth: {
            scope: ['admin']
        },
        handler: (request, h) => {
            const credentials = request.auth.credentials

            return h.view('informes', { 
                credentials,
                isAdmin: (credentials.scope === 'admin') ? true : false,
                socket: process.env.SOCKET_HOST || 'localhost'
            })
        }
    }
}