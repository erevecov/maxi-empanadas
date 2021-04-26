import dotEnv from 'dotenv'

dotEnv.config()

export default {
    method: ['GET'],
    path: '/',
    options: {
        handler: (request, h) => {
            const credentials = request.auth.credentials

            return h.view('home', {
                credentials,
                isAdmin: (credentials.scope === 'admin') ? true : false,
                socket: process.env.SOCKET_HOST || 'localhost'
            })
        }
    }
}