import User from '../../models/User'
import { validatePassword } from '../../utils/passwordHandler'

export default {
    method: ['GET', 'POST'],
    path: '/login',
    options: {
        auth: {
            mode: 'try'
        },
        plugins: {
            '@hapi/cookie': {
                redirectTo: false
            }
        }
    },
    handler: async (request, h) => {
        try {
            if (request.auth.isAuthenticated) return h.redirect('/')

            let account = null

            if (request.method === 'post') {
                let payload = request.payload || { user: null, password: null }

                if (!payload.user || !payload.password) {
                    return h.view('login',
                        {
                            message: 'Debe ingresar su usuario y contraseña'
                        },
                        { layout: false }
                    )
                }

                let findUser = await User.findOne({
                    username: payload.user,
                    status: 'enabled'
                }).lean()

                if (findUser) {
                    if (validatePassword(findUser.password, payload.password)) {
                        account = findUser
                    }
                }

                if (!account) {
                    return h.view('login',
                        {
                            message: 'Usuario o contraseña incorrectos'
                        },
                        {
                            layout: false
                        }
                    )
                }

                const sid = account._id.toString()

                delete account.password

                await request.server.app.cache.set(sid, { account }, 0)

                request.cookieAuth.set({ sid })

                return h.redirect('/')
            }

            return h.view('login', {}, { layout: false })
        } catch (error) {
            console.log(error)

            return h.view('login',
                {
                    message: 'Ha ocurrido un error. por favor vuelta a intentarlo mas tarde'
                },
                { layout: false }
            )
        }
    }
}