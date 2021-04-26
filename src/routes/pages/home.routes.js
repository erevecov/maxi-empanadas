import dotenv from 'dotenv'

dotenv.config()

export default {
    method: ['GET'],
    path: '/',
    options: {
        handler: (request, h) => {
            const credentials = request.auth.credentials

            return h.view('home', {
                credentials,
                isAdmin: (credentials.scope === 'admin') ? true : false,
                ssocket: process.env.SOCKET_HOST || 'localhost'
            })
        }
    }
}