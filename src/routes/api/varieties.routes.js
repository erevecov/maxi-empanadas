import Variety from '../../models/Variety'

export default [
    {
        method: 'GET',
        path: '/api/varieties',
        options: {
            description: 'get all varieties',
            notes: 'get all varieties',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let findVarieties = await Variety.find({})

                    return findVarieties
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
        path: '/api/varieties/{productId}',
        options: {
            description: 'get varieties by productId',
            notes: 'get varieties filtering by productId',
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    let productId = request.params.productId

                    // console.log(productId)
                    // return productId
                    let findVarieties = await Variety.find({
                        product: productId
                    })

                    return findVarieties
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