var db = require('../config/connection')
var collections = require('../config/collections')
const bcrypt = require('bcrypt')
const async = require('hbs/lib/async')
const { PRODUCT } = require('../config/collections')
const { ObjectId } = require('mongodb')
const { response } = require('express')
const objectId = require('mongodb').objectId
const Razorpay = require('razorpay');
var instance = new Razorpay({
    key_id: 'rzp_test_ziyUhStIDdkm2B',
    key_secret: '8NI0swhNxrM1ESu8Oo20FtVj',
});


module.exports = {

    doSignup: (userData) => {
        // console.log(userData)
        return new Promise(async(resolve, reject) => {
            let user = await db.getDb().collection(collections.USER_COLLECTION).findOne({ email: userData.email })
            if (!user) {
                userData.password = await bcrypt.hash(userData.password, 10)
                db.getDb().collection(collections.USER_COLLECTION).insertOne(userData).then((data) => {
                    // console.log(data);
                    resolve(data)
                })
            } else {
                resolve({ emailTaken: true })
            }

        })

    },
    doLogin: (userData) => {
        // console.log(userData)
        return new Promise(async(resolve, reject) => {
            // let loginStatus = false
            let response = {}
            let user = await db.getDb().collection(collections.USER_COLLECTION).findOne({ email: userData.email })
                // console.log(user)
            if (user) {
                bcrypt.compare(userData.password, user.password).then((status) => {
                    if (status) {
                        console.log('login success');
                        response.user = user
                        response.status = true
                        resolve(response)
                    } else {
                        console.log('login failed')
                        resolve({ status: false })
                    }
                })

            } else {
                console.log('login failed')
                resolve({ status: false })
            }
        })
    },
    addToCart: (proId, userId) => {
        let proObj = {
            item: ObjectId(proId),
            quantity: 1
        }
        return new Promise(async(resolve, reject) => {
            let userCart = await db.getDb().collection(collections.CART).findOne({ user: ObjectId(userId) })
            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item == proId)
                    // console.log(proExist);
                if (proExist != -1) {
                    db.getDb().collection(collections.CART).updateOne({
                        user: ObjectId(userId),
                        'products.item': ObjectId(proId)
                    }, {
                        $inc: { 'products.$.quantity': 1 }
                    }).then(() => {
                        resolve()
                    })
                } else {
                    db.getDb().collection(collections.CART).updateOne({ user: ObjectId(userId) }, {

                        $push: {
                            products: proObj
                        }

                    }).then((response) => {
                        resolve(response)
                    })
                }

            } else {
                let cartObj = {
                    user: ObjectId(userId),
                    products: [proObj]
                }
                db.getDb().collection(collections.CART).insertOne(cartObj).then((response) => {
                    resolve(response)
                })
            }
        })
    },
    getCartProducts: ((userId) => {
        return new Promise(async(resolve, reject) => {
            let cartItems = await db.getDb().collection(collections.CART).aggregate([{
                        $match: { user: ObjectId(userId) }
                    }, {
                        $unwind: '$products'
                    }, {
                        $project: {
                            item: '$products.item',
                            quantity: '$products.quantity'
                        }
                    }, {
                        $lookup: {
                            from: collections.PRODUCT,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        }
                    }, {
                        $project: {
                            item: 1,
                            quantity: 1,
                            product: { $arrayElemAt: ['$product', 0] }
                        }
                    }
                    // {
                    //     $lookup: {
                    //         from: collections.PRODUCT,
                    //         let: { prodList: "$products" },
                    //         pipeline: [{
                    //             $match: {
                    //                 $expr: {
                    //                     $in: ["$_id", "$$prodList"]
                    //                 }
                    //             }
                    //         }],
                    //         as: 'cartItems'
                    //     }
                    // }
                ]).toArray()
                // console.log(cartItems[0].product[0])
                // console.log(cartItems)
            resolve(cartItems)
        })
    }),
    getCartCount: ((userId) => {
        return new Promise(async(resolve, reject) => {
            let count = 0
            let cart = await db.getDb().collection(collections.CART).findOne({ user: ObjectId(userId) })
            if (cart) {
                cart = await db.getDb().collection(collections.CART).aggregate([{
                        $match: {
                            user: ObjectId(userId)
                        }
                    }, {
                        $unwind: '$products'
                    }, {
                        $project: {
                            item: '$products.item',
                            quantity: '$products.quantity'
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: { $toInt: '$quantity' } }
                        }
                    }
                ]).toArray()
            }
            // console.log(cart[0].total)
            if (cart && cart[0]) {
                count = cart[0].total
            }
            // console.log(cart.products)
            resolve(count)
        })
    }),
    changeProductQuantity: (details) => {
        details.count = parseInt(details.count)
        details.quantity = parseInt(details.quantity)
        return new Promise((resolve, reject) => {
            if (details.count == -1 && details.quantity == 1) {
                db.getDb().collection(collections.CART).updateOne({
                    _id: ObjectId(details.cart)
                }, {
                    $pull: { products: { item: ObjectId(details.product) } }
                }).then((response) => {
                    resolve({ removeProduct: true })
                })
            } else {
                db.getDb().collection(collections.CART).updateOne({
                    _id: ObjectId(details.cart),
                    'products.item': ObjectId(details.product)
                }, {
                    $inc: { 'products.$.quantity': details.count }
                }).then((response) => {
                    resolve({ status: true })
                })
            }
        })
    },
    removeProduct: (details) => {
        return new Promise((resolve, reject) => {
            db.getDb().collection(collections.CART).updateOne({
                _id: ObjectId(details.cart)
            }, {
                $pull: { products: { item: ObjectId(details.product) } }
            }).then((response) => {
                resolve({ removeProduct: true })
            })
        })
    },
    getTotalAmount: (userId) => {
        return new Promise(async(resolve, reject) => {
            let cartTotal = 0
            let cart = await db.getDb().collection(collections.CART).findOne({ user: ObjectId(userId) })
            if (cart) {
                cart = await db.getDb().collection(collections.CART).aggregate([{
                        $match: { user: ObjectId(userId) }
                    }, {
                        $unwind: '$products'
                    }, {
                        $project: {
                            item: '$products.item',
                            quantity: '$products.quantity'
                        }
                    }, {
                        $lookup: {
                            from: collections.PRODUCT,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        }
                    }, {
                        $project: {
                            item: 1,
                            quantity: 1,
                            product: { $arrayElemAt: ['$product', 0] }
                        }
                    }, {
                        //group is for doing calculation on every single products
                        $group: {
                            _id: null,
                            total: { $sum: { $multiply: ['$quantity', { $toInt: '$product.Price' }] } }
                        }
                    }]).toArray()
                    // console.log(total[0].total)
                if (cart[0]) {
                    cartTotal = cart[0].total
                    resolve(cartTotal)
                }

            }
        })
    },
    placeOrder: (order, products, total) => {
        return new Promise((resolve, reject) => {
            
            let status = order['payment-method'] === 'COD' ? 'placed' : 'pending'
            let orderObj = {
                deliveryDetails: {
                    address: order.address,
                    city: order.city,
                },
                userId: ObjectId(order.userId),
                // check below
                paymentMethod: order['payment-method'],
                products: products,
                totalAmount: total,
                status: status,
                date: new Date()
            }
            db.getDb().collection(collections.ORDER).insertOne(orderObj).then((response) => {
                db.getDb().collection(collections.CART).deleteOne({ user: ObjectId(order.userId) })
                resolve(response.insertedId)
            })
        })

    },
    getCartProductList: (userId) => {
        return new Promise(async(resolve, reject) => {
            let cart = await db.getDb().collection(collections.CART).findOne({ user: ObjectId(userId) })
            resolve(cart.products)
        })
    },
    getCart: (userId) => {
        return new Promise(async(resolve, reject) => {
            let cart = await db.getDb().collection(collections.CART).findOne({ user: ObjectId(userId) })
            resolve()
        })
    },
    getUserOrders: (userId) => {
        return new Promise(async(resolve, reject) => {
            let orders = await db.getDb().collection(collections.ORDER).find({ userId: ObjectId(userId) }).toArray()
            resolve(orders)
        })
    },
    getOrderProducts: (orderId) => {
        return new Promise(async(resolve, reject) => {
            let orderItems = await db.getDb().collection(collections.ORDER).aggregate([{
                    $match: { _id: ObjectId(orderId) }
                }, {
                    $unwind: '$products'
                }, {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                }, {
                    $lookup: {
                        from: collections.PRODUCT,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                }, {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                }]).toArray()
                // console.log(orderItems)
            resolve(orderItems)


        })

    },
    generateRazorpay: (orderId, total) => {
        // console.log('jkdhdjkf', orderId)
        return new Promise((resolve, reject) => {
            var options = {
                amount: total * 100,
                currency: "INR",
                // add something to string to change it to string
                receipt: "" + orderId
            };
            instance.orders.create(options, function(err, order) {
                // console.log(order)
                resolve(order)
            })
        })
    },
    verifyPayment: (details) => {
        return new Promise((resolve, reject) => {
            // check Example: Using the hmac.update() and hmac.digest() methods on NodeJS documentation
            const crypto = require('crypto');
            let hmac = crypto.createHmac('sha256', '8NI0swhNxrM1ESu8Oo20FtVj');
            // check razorpay documentation:Verify Payment Signature

            hmac.update(details['payment[razorpay_order_id]'] + "|" + details['payment[razorpay_payment_id]']);
            hmac = hmac.digest('hex')
            if (hmac == details['payment[razorpay_signature]']) {
                resolve()
            } else {
                reject()
            }
        })
    },
    changeStatus: (oredrId) => {
        return new Promise((resolve, reject) => {
            db.getDb().collection(collections.ORDER).updateOne({ _id: ObjectId(oredrId) }, {
                $set: {
                    status: 'placed'
                }
            }).then(() => {
                resolve()
            })
        })
    }
}
