const internals = {
    selectors: {
        socketConnectionStatus: document.querySelector('#socketConnectionStatus'),
        productSelect: document.querySelector('#productSelect'),
        varietySelect: document.querySelector('#varietySelect'),
        btnProductQtyDiscount: document.querySelector('#btnProductQtyDiscount'),
        btnProductQtyAdd: document.querySelector('#btnProductQtyAdd'),
        productQtyCounter: document.querySelector('#productQtyCounter'),
        btnSaveProductRegister: document.querySelector('#btnSaveProductRegister'),
        productsRegisterTableBody: document.querySelector('#productsRegisterTableBody')
    },
    productQtyCounter: 20
};

document.addEventListener('DOMContentLoaded', function(event) {
    init()
});

async function init () {
    getInitProductRegisters()

    initSubscription()

    counterHandlers()

    getProducts()

    saveHandler()
}


async function initSubscription() { // SOCKET CONNECTION
    try {
        nesClient.subscribe('/productsRegister', async (update, flags) => {
            // console.log(update, flags)

            drawProductRegisters(update.productRegisters, update.new)
        })

        nesClient.onConnect = ()=> {
            internals.selectors.btnSaveProductRegister.disabled = false

            internals.selectors.socketConnectionStatus.innerHTML = `
                <span class="badge rounded-pill socketConnectionStatusBadge isConnected">Conectado al servidor</span>
            `
        }

        nesClient.onDisconnect = ()=> {
            internals.selectors.btnSaveProductRegister.disabled = true

            internals.selectors.socketConnectionStatus.innerHTML = `
                <span class="badge rounded-pill bg-light text-dark">Sin conexión con el servidor</span>
            `
        }

    } catch (error) {
        console.log(error)
    }
}

async function getInitProductRegisters() {
    try {
        let productRegisters = await axios.get(`/api/productRegisters`)

        drawProductRegisters(productRegisters.data, false)
    } catch (error) {
        console.log(error)
    }
}

function drawProductRegisters (productRegisters, isNew) {
    let productRegistersLength = productRegisters.length

    internals.selectors.productsRegisterTableBody.innerHTML = productRegisters.reduce((acc,el,i) => {
        let isNewRowClass = ''

        if (i === 0 && isNew) {
            isNewRowClass = 'class="newRow"'
        }

        acc += `
            <tr ${isNewRowClass}>
                <td>${productRegistersLength - i}</td>
                <td>${moment(el.date).format('DD/MM/YYYY HH:mm:ss')}</td>
                <td>${el.user.name.toUpperCase()}</td>
                <td>${el.product.name.toUpperCase()}</td>
                <td>${el.variety.name.toUpperCase()}</td>
                <td><b>${el.qty}</b></td>
                <td><button data-rowid="${el._id}" type="button" class="btn btn-dark btn-sm infoAdvice"><i class="fas fa-exclamation-circle"></i></i></button></td>
            </tr>
        `

        return acc
    }, '')

    Array.from(document.querySelectorAll('.infoAdvice')).forEach(el=> {
        el.addEventListener('click', ()=> {
            createInfoAdvice(el.dataset.rowid)
        })
    })
}

async function createInfoAdvice(registerId) {
    let infoAdviceText = await Swal.fire({
        title: 'Deja un mensaje al administrador',
        inputLabel: 'En caso de que haya algún error referente a este registro, puedes detallarlo en el area de texto.',
        input: 'textarea',
        inputPlaceholder: 'Escribe un mensaje...',
        inputAttributes: {
            'aria-label': 'Escribe un mensaje...'
        },
        confirmButtonText: 'Enviar',
        cancelButtonText: 'Cancelar',
        showCancelButton: true
    })

    if (infoAdviceText.isConfirmed) {
        if (infoAdviceText.value.length > 0) {
            let saveInfoAdvice = await axios.post('/api/saveInfoAdvice', {
                registerId,
                message: infoAdviceText.value
            })

            if (saveInfoAdvice.data.ok) {
                notyf.success('Mensaje enviado correctamente')
            }

            if (saveInfoAdvice.data.error) {
                notyf.error(saveInfoAdvice.data.error)
            }
        } else {
            notyf.open({
                type: 'warning',
                message: '* El mensaje debe tener al menos 1 caracter'
            })
        }
    }
}

function counterHandlers () {
    new Cleave(internals.selectors.productQtyCounter, {
        numeral: true,
        numeralPositiveOnly: true,
        delimiter: '',
        blocks: [6],
        onValueChanged: function (e) {
            internals.productQtyCounter = parseInt(e.target.value)

            if (e.target.value < 1 || e.target.value > 99999) {
                notyf.open({
                    type: 'warning',
                    message: '* La cantidad no puede ser menor a 1 ni mayor a 99999'
                })
            }
        }
    })

    internals.selectors.btnProductQtyDiscount.addEventListener('click', () => {
        if (internals.productQtyCounter > 1) {
            internals.productQtyCounter -= 1
            internals.selectors.productQtyCounter.value = internals.productQtyCounter
        }

    })

    internals.selectors.btnProductQtyAdd.addEventListener('click', () => {
        if (internals.productQtyCounter < 99999) {
            internals.productQtyCounter += 1
            internals.selectors.productQtyCounter.value = internals.productQtyCounter
        }
    })

    internals.selectors.productQtyCounter.value = internals.productQtyCounter
}

async function saveHandler() {
    internals.selectors.btnSaveProductRegister.addEventListener('click', async () => {
        try {
            let errorValidationCounter = 0

            let dataToPost = {
                product: internals.selectors.productSelect.value,
                variety: internals.selectors.varietySelect.value,
                qty: internals.productQtyCounter
            }

            // console.log(dataToPost)

            if (internals.selectors.productSelect.value !== '0') {
                errorValidationCounter += 1
            } else {
                notyf.open({
                    type: 'warning',
                    message: '* Debe seleccionar un producto'
                })
            }

            if (internals.selectors.varietySelect.value !== '0') {
                errorValidationCounter += 1
            } else {
                notyf.open({
                    type: 'warning',
                    message: '* Debe seleccionar una variedad'
                })
            }

            if (internals.productQtyCounter >= 1 && internals.productQtyCounter <= 99999) {
                errorValidationCounter += 1
            } else {
                notyf.open({
                    type: 'warning',
                    message: '* La cantidad no puede ser menor a 1 ni mayor a 99999'
                })
            }

            if (errorValidationCounter === 3) {
                internals.selectors.btnSaveProductRegister.disabled = true

                setTimeout(() => {
                    internals.selectors.btnSaveProductRegister.disabled = false
                }, 3000)

                await axios.post('/api/productRegister', dataToPost)
            }
        } catch (error) {
            console.log(error)
        }
    })
}


async function getProducts() {
    try {
        let products = await axios.get('/api/products')

        if (products.data[0]) {
            internals.selectors.productSelect.innerHTML = products.data.reduce((acc,el) => {
                acc += `
                    <option value="${el._id}">${el.name.toUpperCase()}</option>
                `

                return acc
            }, '')
        } else {
            internals.selectors.productSelect.innerHTML = '<option value="0">-SELECCIONE UN PRODUCTO-</option>'
        }


        getVarieties(internals.selectors.productSelect.value)

        internals.selectors.productSelect.addEventListener('change', (el) => {
            getVarieties(el.target.value)
        })
    } catch (error) {
        console.log(error)
    }
}

async function getVarieties(productId) {
    try {
        let varieties = await axios.get(`/api/varieties/${productId}`)

        if (varieties.data[0]) {
            internals.selectors.varietySelect.innerHTML = varieties.data.reduce((acc,el) => {
                acc += `
                    <option value="${el._id}">${el.name.toUpperCase()}</option>
                `

                return acc
            }, '')
        } else {
            internals.selectors.varietySelect.innerHTML = '<option value="0">-SELECCIONE UNA VARIEDAD-</option>'
        }

    } catch (error) {
        console.log(error)
    }
}