const { urlencoded } = require('express');
const { response } = require('express');
var express = require('express');
const req = require('express/lib/request');
var router = express.Router();
var productHelper = require('../helpers/product-helpers');
const fs = require('fs');
const res = require('express/lib/response');
const async = require('hbs/lib/async');

router.get('/', function(req, res, next) {
    // let products = [{
    //         Name: "iphone",
    //         Category: 'mobile',
    //         Description: 'This is a phone',
    //         image: 'data:image/jpeg;base64,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'
    //     },
    //     {
    //         name: "iphone2",
    //         category: 'mobile',
    //         description: 'This is a phone',
    //         image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTO6s8TF6b1Ox2gjZozrcT2eHhme3WjwDRGZA&usqp=CAU'
    //     },
    //     {
    //         name: "iphone3",
    //         category: 'mobile',
    //         description: 'This is a phone',
    //         image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxESEhUSEBIVEBAVFRYVEBUVFRUXFRMVGBcXFxUWFxUYHSggGBolIBcVITEhJSkrLi4uFx8zODMsNygvLisBCgoKDg0OGxAQGS0fHyUtLi0rLS0rLTctLS0tLS01LS0tLTctLSsrLy0tKy8tKysrLTUtLi0rLS0tLTctLS0tK//AABEIAKMBNgMBIgACEQEDEQH/xAAcAAEAAgMBAQEAAAAAAAAAAAAABQYCAwQHAQj/xABGEAACAQIDAwgFCAgEBwAAAAAAAQIDEQQSIQUxUQYTQWFxgZGhByIykrEUUmJyorLB0SMzQlNj0uHwQ4PC8TREVHOCk7P/xAAaAQEBAAMBAQAAAAAAAAAAAAAAAQIDBAUG/8QAJxEBAQACAQQBBAEFAAAAAAAAAAECEQMEEiExcQVBUWEyE0KRofD/2gAMAwEAAhEDEQA/APZAAAAAAAAAAAAAAAADkltOipOOdOS3pJyt25Uz5tabVJqLtKTUE+GZ2flcjsJBRSUEkm79z1XgreBlJsStPG0pOyqRb4Zlfw3nQUdcu9myr/JXiIurmyawnzbnuy841lv0b7FhWGgt0cn1G4/dsXtVLgjMs17NSaXW1L7yb8zKNequmEu2Li/FN/AnbUSIOFY2fTTv9Waf3sptp46DdneDfzlZX4Zt1+8mqOkAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHBtaWkP+7B9yu38Dho07xy7vVa7PVijq22tIf5n/wA5f0IvbeNlQw1etBZp06c5wW+71tp3GePpXhWL5K47npYVYOrKrzvq1ckubkszfOOp7Nmmru9ll43PeZ7Vw9CVKhXxFKNecYqEZTjGVR+zdRbu7tNLi9Dxfk1yux9PF0JzxU69OtVjGrTnLNGSlp6kf2Opxt0b9xfOWfo5+XYuOJWI5qNoRrRy3laDdnTlf1W0+5q+u4T9EX/9nv8AyMJSS1bsukyqStEpXLzGVPkeIdNtOFPNpfVuUY9HU2ZCaxfKzA021PE07rek8zXgQuM9JmzI3jz2foaUdOzWyN2xeQOzqFOMXh6eInlWepViqjnK2rtK6iupKxP4bZ1GnpSo06a6MlOEfgjDvorFD0rUnGKo4PF4qSik5Qptxk7b7pNvwInE+mOtzio0tntVXNU1CpKSlnk0oxccqd22t9t56PcgsVyWwdTFwxlSm3Xg4STUpKMpwtklKK0lKNlZ9S4GOzTgeP5Sz/5XCYVfxKkZP7Dmans/lBU/WbQw9BcKUJTfi4wLlPFXPiZhcqy7VIq8mtrxTnS2xN1lrGMqTVOT6FK85adeV9hceRW254zCxqVoKniIynSxMFujWpvLNLV9Ttd2vbU2siORkubxe0aG5c7SxEOtVqaU378GZSsbFvABUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARm1n60F1N+MoQ+EmRe1tpUcNh6lbEa0ow9dWTck7+qk97d7EhtGV6tuhRS728/wgV7lfsd43B1cMpKFSWWVNy0jng04pvhobJ6VSPR9PYlbGp0cNVoYlXnh41ZudO61bgr6SSu0pX6tUWbE7Yxi2hGnGcmnWjB4bmVkdBv1qyq5bq0bTzZmm7wtdFY9H/IHHUsbDE4uMaFOleyU4TlVdmo2yNpRu73eulra3XrtxJdD5i/ZXYVHGU86q03rnpTS65WeXzsWzGbu4q0qmWtF8H/sWiU5LYh1MHh5Sd5c1CM3xnFZJ/aiyUKfyY2jHD06uGytuhiK0F0JqT5y6fC85eB2V9v1OhKPdf4lw6bkzm5FWQ58a7RvwKrV5QV+iX2Y/kaa/KOtlallkmrO8fysbZ0fJKbWGnilfed1KsmUPD7WUldPt6n0ok8Htbixy9JrzFl2t6kQlCapbYpO+mJwdSnbozUJqpfttUa7jdh8en0kVt/FZK+Brr/DxcYTfCFaMqcvPIclmq3f0rcLXogADmAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQ2J/XS7YW9yd/vI+yppmEp3qzf0px91Ul+ZtubZ6Vr5lGcIW6+1tn24uUYYl6MqWPlad+Dv4FsxG5lQ2j7RKI/FLJjKyv6tSnSqQXXFONR97a8DKc2YbZ0q4Sr0yhUw9+Ciucd+2SSE2ep0d3x6/CNEzVONzdM0yOvS6Q+MoTpydSnrf24/O611jDbST1T/oSU1chdo7Pu89N5Z9PCXb+Zhlj+Fk0nsHtZrpMuUuLz4WpZ2cUqifB05Kp/pKasc4vLNZZfHsfSTOzYYitFxjSnKMk1mtaLTVvadkeV1OH3j1+kzxzwvHfvHvGCxCqU4VFunCM12Sin+JvKz6N8U6mzcPm0nCLozXCVKThbwSLMcbxgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMZSsm+CuBBUZXbfG78ZyT+4jfc5cNu7l5uU/8AWb7m6KzuLmFxcKxxD0KltJ+sWvEPRlT2i/WFRwba/wCEU07OjXpzb4U07z8bpCZvdFVaGIpPVTpNvsh6z+CI/A189KE3o5Qi2uDaTa8bnd0OX8sRsmjnmb5LgcmIqWWp6FZyNdSRngcBUrv1VaPTJ7u7idOytlup69TSH7MemXW+r4/Gy08sVpolokvwRx8vU68YvR4Oi3O7P/Dj2fybw8LSlBVJrVSmk7PqW5PzJSUbMxUmYZO9nBlbl5rvwwmPieG/0bzyvHYe93TxbqLqjXhGql2asuhQOS83T2pVg9FiMJCa650aji/sziX8577eBz49vJlP2AAjUAAAAAAAAAAAAAAAAAAAAAAAAAAAacXK0Jv6Mvgbjj2vK1Gb+j+KAiaGi7oeVOCfwNlzDpl9aa8JNI+S3aG+K2XFzTFdvf3/ANPAy1/vv/p4BTEPQqm0X6xZq97PTzt0alax7WZ9/wCFr+fiSox2TJc6lL2ZXUuy138CC2ZFxjKnJ3lTqVIy6vWcku5SSJSjNKUXwab8bs4sbHJjMTG1lJ061+LqL1u+0YrtaOjpMtcvys9salVIbKwXPTzSX6OL3dEpcOxf30mpycqkYR3ysr9PQ3bwfi0WfCYdQSilaKVrd97/AN8WdXU81k7Y9Lo+HuvdZ4jdFKJp+Vee421t3XbTw087mmKWa9unr3X/ANjztvWxu5ux006xtUuByysrdmuvTZf1NvPKw2ws36jkxNVU8fs+txq1MPLrVam7X/8AKCPRzyblZUccPzsV61CpSrx/y6kW37uY9XhNSSktzSa7HqjVl7eL1/H2cvzGQAMXEAAAAAAAAAAAAAAAAAAAAAAAAAAAcW1vYS6JThF98kdpHbZnZQ+upd0E5fkWexGU5XSfHXx1/Eyua6SskuCS8jI3MmVxcxufbgYV3oVbaPtFnxD0KvtHeSo4jTykf6bD1b6VKMoS66iefyirG43ctcLkwuEqW1hzMuznoZakuy0X4mXHl25y/sntzcm6N5Sqvo9SPk5P4eZYmRWxaeWnBbtMz7Xr+JIwnc2cuXdna+m4eLs45GNWZrTPs1qLGp0TxByVtTOBql1HyM+0x2uttW1aHO0qlJ/t05w96LX4lx5B47n9nYSpe7dCEZfWgskvOLKlOZL+iurbD16D/wADF1oxX0JtVYeU2YZPI+q8epjl8xdAAYvGAAAAAAAAAAAAAAAAAAAAAAAAAAAIjbz9hfRrP7Fl5tEuQm25eul/DXnVgi4+xygA3qwqQbtZ23/AwVGXz3/febgBzVYS+dfd8NSubR3lnr7isbR3ko4KkrJvgmW30g7OzYGUFo1RyxfBwyu/gplVp08zUfnNR95pfiel8ocPzlJx4vK+yacH94132jzzD1s1OEo+zKMZLsauvJm1Ta3HDyfqKWHhFrK4ZqaXDJJxj5JeJJ5OBk+x4s5lhMte4zctDHMJwuuBitN4WaZNH3JZGFzK5BpmtUdno+rZNoYyl+9o0MQl1xzUpW8InJNXNWyKvNbUwc+irCvh5driqkF4wZjXF9Tw7un3+LP+/wBvVAAYvmgAAAAAAAAAAAAAAAAAAAAAAAAAACA2tK9WXZTj9+fxiT5D7b2XOo1UotKaspRlopJNta9DV5Lrv0FxvkcJ9Pqw2I6aEr9U6VvvD5NX/cS9+l/Obu6K+A+/Jq/7iXv0v5z78mr/ALiXv0v5huG2ivuKxtHeWqrg8Q1pQl79L+YhcXsHGSemHf8A7KP85LYI3ZFPNXor+LTfhNN/A9Lx9PNTmunK7dq1RWuTXJmpTqKtiMsXG/Nwi8zzNNZpPdom9Fffe+hbDXlfKPIKEcmIxNO/+NzkF82FSKyr7LfeSFOoc+2aHN7Qat+soavroz5uMX12uzfNcDKPqfp+cz6fGX7eG5zNFaWpg5s+y3C13THTOnO5m2zlpvXqOiU0lduy4vcRMpqsUR23q3NKhiP+nxVCq39HOoS+zNmrG8psHTvmrwbXRB534QuVTlTyshiKMsPhoTm6lk5NWuk07RjvbbSW5Erh6zn4f6WWNym9en6TBz4BSVKmqn6xU4Kf1sqzedzoMXy4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADzD0m1Fh6tLESuoQqtVGlf1asFFadTzy7iMlyjwajeWJpW6ppv3VdnonK3k1Tx1J05PK2rX6Hw7GrvXre+55vhfQhLN+lxccvQowk35tGW3d03XZ8GFxkl+6JxvLnBx/V85V+rDKvttfAia/L6tJNUcPFcHJym+9RSt4nqezPRHs2lZzVSu185pLwSv5lpwHJnBUbc1hqUWtzcVKXvSuybXP6n1GX92vh+f8AD1Ns4p/oo1LP93TsveScvMlMJ6KNqYhp4iSjxdWpmfdq35H6BStotEfSOTPl5M/5ZW/NeSbN9CVJW+UYly4qEfJSdvgXPk/yC2fg5KdKlmqrVTnZtPoaSSV+u1y0ANYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k='
    //     },
    //     {
    //         name: "iphone4",
    //         category: 'mobile4',
    //         description: 'This is a phone',
    //         image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjKe4RatKfd7qw9I2j7DQNCoxGFazwtUWpHA&usqp=CAU'
    //     }
    // ]

    productHelper.getAllProducts().then((products) => {
        // console.log(products)

        res.render('admin/view-products', { admin: true, products });

    })


    // res.render('admin/view-products', { admin: true, products });
});

router.get('/add-product', function(req, res) {
    res.render('admin/add-products', { admin: true })
});


router.post('/add-product', (req, res) => {
    // console.log(req.body);
    // console.log(req.files.image);\


    productHelper.addProduct(req.body, (insertId) => {

        var image = req.files.image
            // console.log(insertId)
            // mv() is from fileupload module
        image.mv('./public/product-images/' + insertId + '.jpg', (err, done) => {
            if (!err) {
                res.render('admin/add-products', { admin: true })

            } else { console.log(err) }
        })


    })
});
// if we passing value in url, call it from  get through req.query or req.params.
// if teh value is passing through submit, call it using req.body through post


// PARAMS METHOD
router.get('/delete-product/:id', (req, res) => {
    let proId = req.params.id
    console.log(proId);
    productHelper.deleteProduct(proId).then((response) => {
        if (response) {
            const path = './public/product-images/' + proId + '.jpg'
            try {
                fs.unlinkSync(path)
                console.log('Deleted')
            } catch (err) {
                console.log(err)
            }
        }
        res.redirect('/admin/')
    })
})

// QUERY METHOD
// router.get('/delete-product/', (req, res) => {
//     let proId = req.query.id
//     console.log(proId)
//     console.log(req.query.name)
// })

router.get('/edit-product/:id', async(req, res) => {
    let product = await productHelper.getProductDetails(req.params.id)
        // console.log(product);
    res.render('admin/edit-product', { admin: true, product })
})
router.post('/edit-product/:id', (req, res) => {
    productHelper.updateProduct(req.params.id, req.body).then(() => {
        res.redirect('/admin')
        if (req.files.image) {
            let image = req.files.image
            image.mv('./public/product-images/' + req.params.id + '.jpg')

        }
    })
})

module.exports = router;