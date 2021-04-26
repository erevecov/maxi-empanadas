import Product from '../../models/Product'

export default [
    {
        method: 'GET',
        path: '/api/products',
        options: {
            description: 'get all products',
            notes: 'get all products',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let findProducts = await Product.find({})

                    return findProducts
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