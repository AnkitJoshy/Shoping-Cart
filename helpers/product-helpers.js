var db = require('../config/connection')
var collections = require('../config/collections')
const async = require('hbs/lib/async')
const { promise } = require('bcrypt/promises')
const { response } = require('express')
var objectId = require('mongodb').ObjectId

module.exports = {

    addProduct: (product, callback) => {
        // console.log(product)
        db.getDb().collection('product').insertOne(product).then((data) => {
            // console.log(data);
            callback(data.insertedId)

        })
    },
    getAllProducts: () => {
        return new Promise(async(resolve, reject) => {
            let products = await db.getDb().collection(collections.PRODUCT).find().toArray()
            resolve(products)
        })

    },
    deleteProduct: (proId) => {
        return new Promise((resolve, reject) => {
            db.getDb().collection(collections.PRODUCT).deleteOne({ _id: objectId(proId) }).then((response) => {
                resolve(response)
            })
        })
    },
    getProductDetails: (proId) => {
        return new Promise((resolve, reject) => {
            db.getDb().collection(collections.PRODUCT).findOne({ _id: objectId(proId) }).then((product) => {
                resolve(product)
            })
        })
    },
    updateProduct: (proId, proDetails) => {
        return new Promise((resolve, reject) => {
            db.getDb().collection(collections.PRODUCT).updateOne({ _id: objectId(proId) }, {
                $set: {
                    Name: proDetails.Name,
                    Description: proDetails.Description,
                    Price: proDetails.Price,
                    Category: proDetails.Category
                }
            }).then((response) => {
                resolve()
            })
        })
    }


}