import Hapi from '@hapi/hapi'
import catboxRedis from '@hapi/catbox-redis'
import Boom from '@hapi/boom'
import Inert from '@hapi/inert'
import Vision from '@hapi/vision'
import hapiCookie from '@hapi/cookie'
import hapiRedis from 'hapi-redis2'
import moment from 'moment'
import hapiRouter from 'hapi-router'
import Handlebars from 'handlebars'
import HandlebarsExtendBlock from 'handlebars-extend-block'
import Nes from '@hapi/nes'
import dotEnv from 'dotenv'

import './database'

dotEnv.config()

const internals = {}

internals.server = async () => {
    try {
        let server = await Hapi.server({
            host: '0.0.0.0',
            port: process.env.SERVER_PORT || 3001,
            cache: {
                provider: {
                    constructor: catboxRedis,
                    options: {
                        partition: 'maxiempanadasservercookies',
                        host: process.env.REDIS_HOST || '127.0.0.1',
                        port: 6379,
                        password: process.env.REDIS_PASSWORD,
                        db: 15
                    }
                }
            },
            routes: {
                payload: {
                    maxBytes: 100485760,
                },
                cors: {
                    origin: ['*'],
                    credentials: true
                },
                validate: {
                    failAction: (request, h, err) => {
                        console.error('ValidationError:', err.message)
                        throw Boom.badRequest(err)
                    }
                }
            }
        })


        await server.register([
            Inert,
            Vision,
            hapiCookie,
            {
                plugin: hapiRedis,
                options: {
                    settings: {
                        port: 6379,
                        host: process.env.REDIS_HOST || '127.0.0.1',
                        family: 4,
                        password: process.env.REDIS_PASSWORD,
                        db: 11
                    },
                    decorate: true
                }
            }
        ])

        const cache = server.cache({
            segment: 'sessions',
            expiresIn: moment.duration(24, 'hours').asMilliseconds()
        })

        server.app.cache = cache

        server.auth.strategy('session', 'cookie', {
            cookie: {
                name: 'sid-maxiempanadas',
                password: process.env.SECRET_KEY,
                isSecure: false,
            },
            redirectTo: '/login',
            validateFunc: async (request, session) => {
                const cached = await cache.get(session.sid)
                const out = {
                    valid: !!cached
                }

                if (out.valid) {
                    out.credentials = cached.account
                }

                return out
            }
        })

        server.auth.default('session')

        await server.register([
            {
                plugin: Nes,
                // options: {
                //     auth: false
                // }
                options: {
                    auth: {
                        type: 'token',
                        password: process.env.SECRET_KEY
                    }
                }
            },
            {
                plugin: hapiRouter,
                options: {
                    routes: (!process.env.STATUS || process.env.STATUS === 'dev') ? 'src/routes/**/*.routes.js' : 'dist/routes/**/*.routes.js'
                }
            }
        ])

        await server.subscription('/productsRegister')

        await server.views({
            engines: {
                html: {
                    module: HandlebarsExtendBlock(Handlebars),
                    isCached: false
                }
            },
            path: 'views',
            layoutPath: 'views/layout',
            layout: 'default'
        })

        await server.initialize()
        await server.start()
        console.log('Server running on %s', server.info.uri)

        process.on('unhandledRejection', (err) => {
            console.log(err)
            process.exit(1)
        })

    } catch (error) {
        console.log(error)
    }
}

internals.start = async function() {
    try {
        await internals.server()
    }
    catch (error) {
        console.error(error.stack)
        process.exit(1)
    }
}

internals.start()