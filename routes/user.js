var express = require('express');
const async = require('hbs/lib/async');
var router = express.Router();
var productHelper = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');


// Creating a middleware to check loggedIn status

const verifyLogin = (req, res, next) => {
    if (req.session.loggedIn) {
        next()
    } else {
        res.redirect('/login')
    }
}
const verifyCart = async(req, res, next) => {
    let cart = await userHelpers.getCartCount(req.session.user._id)
    if (cart) {
        next()
    } else {
        res.redirect('/')
    }
}




/* GET home page. */
router.get('/', async function(req, res) {
    let user = req.session.user
        // console.log(user)

    let cartCount = null
    if (user) {
        cartCount = await userHelpers.getCartCount(req.session.user._id)
    }
    
    productHelper.getAllProducts().then((products) => {
        // console.log(products)
        // console.log(user._id)

        res.render('users/view-products.hbs', { admin: false, products, user, cartCount });

    })
});
router.get('/login', (req, res) => {
    if (req.session.loggedIn) {
        res.redirect('/')
    } else {

        res.render('users/login.hbs', { "loginError": req.session.loginError })
        req.session.loginError = null
    }
});

router.get('/signup', (req, res) => {
    if (req.session.loggedIn) {
        res.redirect('/')
    } else {
        res.render('users/signup')
    }

})


router.post('/signup', (req, res) => {
    userHelpers.doSignup(req.body).then((response) => {
        // console.log(response);
        // console.log(response.acknowledged)
        if (response.acknowledged) {
            res.redirect('/login')
        } else {
            res.render('users/signup.hbs', { email: true });
        }
    })
})

router.post('/login', (req, res) => {
    console.log(req.body)
    userHelpers.doLogin(req.body).then((response) => {
        if (response.status) {
            req.session.loggedIn = true
            req.session.user = response.user
            res.redirect('/')
        } else {
            req.session.loginError = "Invalid Email address or Password!"
            res.redirect('/login')
        }
    })

})
router.get('/logout', (req, res) => {
    req.session.destroy()
    res.redirect('/')
})
router.get('/animation', (req, res) => {
    res.render('users/orbitAnimation')
})

router.get('/cart', verifyLogin, verifyCart, async(req, res) => {
    let products = await userHelpers.getCartProducts(req.session.user._id)
    let user = req.session.user
    let total = await userHelpers.getTotalAmount(req.session.user._id)

   
    res.render('users/cart', { products, user, total });
})


router.get('/add-to-cart/:id', (req, res) => {
    // console.log("api call");
    userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
        // res.redirect('/')
        res.json({ status: true })
    })
})
router.post('/change-product-quantity', (req, res, next) => {
    console.log(req.body)
    userHelpers.changeProductQuantity(req.body).then(async(response) => {
        let total = await userHelpers.getTotalAmount(req.body.user)
        response.total = total
        res.json(response)
    })
})
router.post('/remove', (req, res, next) => {
    userHelpers.removeProduct(req.body).then((response) => {
        res.json(response)
    })

})
router.get('/place-order', verifyLogin, async(req, res) => {
    let user = req.session.user
    let userId = req.session.user._id
    let total = await userHelpers.getTotalAmount(req.session.user._id)
    res.render('users/place-order.hbs', { total, userId, user })
})
router.post('/place-order', verifyLogin, async(req, res) => {
    let products = await userHelpers.getCartProductList(req.body.userId)
    let totalPrice = await userHelpers.getTotalAmount(req.body.userId)
    userHelpers.placeOrder(req.body, products, totalPrice).then((orderId) => {
        if (req.body['payment-method'] === 'COD') {
            res.json({ codSuccess: true })
        } else {
            userHelpers.generateRazorpay(orderId, totalPrice).then((response => {
                res.json(response)
            }))
        }
    })
})
router.get('/order-success', verifyLogin, (req, res) => {
    res.render('users/order-success.hbs', { user: req.session.user })
})
router.get('/orders', verifyLogin, async(req, res) => {
    let orders = await userHelpers.getUserOrders(req.session.user._id)
    res.render('users/orders.hbs', { user: req.session.user, orders })
})
router.get('/view-order-products/:id', verifyLogin, async(req, res) => {
    let products = await userHelpers.getOrderProducts(req.params.id)
    res.render('users/view-order-products.hbs', { user: req.session.user, products })
})
router.post('/verify-payment', (req, res) => {
    console.log(req.body)
    userHelpers.verifyPayment(req.body).then(() => {
        userHelpers.changeStatus(req.body['order[receipt]']).then(() => {
            // console.log('success')
            res.json({ status: true })
        })
    }).catch((err) => {
        res.json({ status: false, errMsg: '' })
    })
})

module.exports = router;
