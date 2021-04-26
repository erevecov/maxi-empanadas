import { generatePassword, hashPassword } from '../../utils/passwordHandler'

export default [
    {
        method: 'GET',
        path: '/api/generatePassword/{pass?}',
        options: {
            description: 'create random password',
            notes: 'create random password',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let customPassword = request.params.pass

                    if (customPassword) {
                        return {
                            original: customPassword,
                            password: hashPassword(customPassword)
                        }
                    }

                    let passwordGenerated = generatePassword()

                    return {
                        original: passwordGenerated,
                        password: hashPassword(passwordGenerated)
                    }
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