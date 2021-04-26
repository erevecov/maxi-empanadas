import Joi from 'joi'
import moment from 'moment'
import ProductRegister from '../../models/ProductRegister'

export default [
{
    method: 'GET',
    path: '/api/productRegisters',
    options: {
        description: 'get all product registers',
        notes: 'get all product registers',
        tags: ['api'],
        handler: async (request, h) => {
            try {
                let productsRegisters = await getProductRegisters()

                return productsRegisters
            } catch (error) {
                console.log(error)

                return h.response({
                    error: 'Internal Server Error'
                }).code(500)
            }
        }
    }
},
{
    method: 'GET',
    path: '/api/productRegister/{registerId}',
    options: {
        description: 'get register by id',
        notes: 'get register by id',
        tags: ['api'],
        handler: async (request, h) => {
            try {
                let registerId = request.params.registerId

                let productRegisterRes = await ProductRegister.findById(registerId)

                if (productRegisterRes) {
                    return productRegisterRes
                }

                return false
            } catch (error) {
                console.log(error)

                return h.response({
                    error: 'Internal Server Error'
                }).code(500)
            }
        }
    }
},
{
    method: 'DELETE',
    path: '/api/deleteRegister/{registerId}',
    options: {
        description: 'delete register by id',
        notes: 'delete register by id',
        tags: ['api'],
        auth: {
            scope: ['admin']
        },
        handler: async (request, h) => {
            try {
                let registerId = request.params.registerId

                let productRegisterRes = await ProductRegister.findByIdAndDelete(registerId)

                if (productRegisterRes) {
                    let productRegisters = await getProductRegisters()

                    request.server.publish('/productsRegister', {
                        new: true,
                        productRegisters
                    })

                    return true
                }

                return false
            } catch (error) {
                console.log(error)

                return h.response({
                    error: 'Internal Server Error'
                }).code(500)
            }
        }
    }
},
{
    method: 'POST',
    path: '/api/productRegister',
    options: {
        description: 'insert product register',
        notes: 'insert product register',
        tags: ['api'],
        handler: async (request, h) => {
            try {
                let payload = request.payload
                let credentials = request.auth.credentials

                let newRegister = new ProductRegister({
                    product: payload.product,
                    variety: payload.variety,
                    user: credentials._id,
                    qty: payload.qty,
                    date: moment().format('YYYY-MM-DDTHH:mm:ss')
                })

                await newRegister.save()

                let productRegisters = await getProductRegisters()

                request.server.publish('/productsRegister', {
                    new: true,
                    productRegisters
                })

                return true
            } catch (error) {
                console.log(error)

                return h.response({
                    error: 'Internal Server Error'
                }).code(500)
            }
        },
        validate: {
            payload: Joi.object().keys({
                product: Joi.string().required(),
                variety: Joi.string().required(),
                qty: Joi.number().integer().required(),
            })
        }
    }
},
{
    method: 'POST',
    path: '/api/findProductRegisters',
    options: {
        description: 'find product registers',
        notes: 'find product registers',
        tags: ['api'],
        auth: {
            scope: ['admin']
        },
        handler: async (request, h) => {
            try {
                let payload = request.payload

                let query = {
                    date: {
                        $gt: `${payload.initDate}T00:00:00`,
                        $lt: `${payload.endDate}T23:59:59`
                    }
                }

                if (payload.user) query.user = payload.user
                if (payload.product) query.product = payload.product
                if (payload.variety) query.variety = payload.variety

                let productRegisters = await ProductRegister.find(query)
                .populate('product', ['name'])
                .populate('variety', ['name'])
                .populate('user', ['name'])

                return productRegisters
            } catch (error) {
                console.log(error)

                return h.response({
                    error: 'Internal Server Error'
                }).code(500)
            }
        },
        validate: {
            payload: Joi.object().keys({
                initDate: Joi.string().required(),
                endDate: Joi.string().required(),
                user: Joi.string().optional(),
                product: Joi.string().optional(),
                variety: Joi.string().optional()
            })
        }
    }
},
{
    method: 'POST',
    path: '/api/updateRegister',
    options: {
        description: 'update register',
        notes: 'update register',
        tags: ['api'],
        auth: {
            scope: ['admin']
        },
        handler: async (request, h) => {
            try {
                let payload = request.payload

                let productRegister = await ProductRegister.findById(payload.id)

                if (productRegister) {
                    productRegister.user = payload.user
                    productRegister.product = payload.product
                    productRegister.variety = payload.variety
                    productRegister.qty = payload.qty

                    await productRegister.save()


                    let productRegisters = await getProductRegisters()

                    request.server.publish('/productsRegister', {
                        new: true,
                        productRegisters
                    })

                    return true
                }

                return false
            } catch (error) {
                console.log(error)

                return h.response({
                    error: 'Internal Server Error'
                }).code(500)
            }
        },
        validate: {
            payload: Joi.object().keys({
                id: Joi.string().required(),
                user: Joi.string().required(),
                product: Joi.string().required(),
                variety: Joi.string().required(),
                qty: Joi.number().integer().positive().required()
            })
        }
    }
},
{
    method: 'POST',
    path: '/api/saveInfoAdvice',
    options: {
        description: 'find product registers',
        notes: 'find product registers',
        tags: ['api'],
        handler: async (request, h) => {
            try {
                let payload = request.payload

                let productRegister = await ProductRegister.findById(payload.registerId)

                if (productRegister) {
                    productRegister.advices.push({
                        message: payload.message
                    })

                    await productRegister.save()

                    return {
                        ok: true
                    }
                }

                return {
                    error: 'No se encuentra el registro. Por favor recargue la página e intentelo nuevamente.'
                }
            } catch (error) {
                console.log(error)

                return h.response({
                    error: 'Internal Server Error'
                }).code(500)
            }
        },
        validate: {
            payload: Joi.object().keys({
                registerId: Joi.string().required(),
                message: Joi.string().required()
            })
        }
    }
}
]


async function getProductRegisters() {
    try {
        let today = moment().format('YYYY-MM-DD')

        let productRegisters = await ProductRegister.find({
            date: {
                $gt: `${today}T00:00:00`,
                $lt: `${today}T23:59:59`
            }
        })
        .populate('product', ['name'])
        .populate('variety', ['name'])
        .populate('user', ['name'])
        .sort({date: 'desc'})

        return productRegisters
    } catch (error) {
        console.log(error)

        return []
    }
}