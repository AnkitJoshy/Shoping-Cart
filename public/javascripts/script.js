function addToCart(proId) {
    $.ajax({
        url: '/add-to-cart/' + proId,
        method: 'get',
        success: (response) => {
            if (response.status) {
                let count = $('#cartCount').html()
                count = parseInt(count) + 1
                $('#cartCount').html(count)
            }
            // alert(response)
        }
    })
}



function changeQuantity(cartId, proId, userId, count) {
    let quantity = parseInt(document.getElementById(proId).innerHTML)
    count = parseInt(count)
    $.ajax({
        url: '/change-product-quantity',
        data: {
            user: userId,
            cart: cartId,
            product: proId,
            count: count,
            quantity: quantity
        },
        method: 'post',
        success: (response) => {
            if (response.removeProduct) {
                alert("Do you want to remove this product?")
                location.reload()
            } else {
                document.getElementById(proId).innerHTML = quantity + count;
                document.getElementById('total').innerHTML = response.total
            }
        }
    })
}

function remove(cartId, proId) {
    $.ajax({
        url: '/remove',
        data: {
            cart: cartId,
            product: proId,

        },
        method: 'post',
        success: (response) => {
            if (response.removeProduct) {
                alert("Do you want to remove this product?")
                location.reload()
            }
        }
    })
}

//     function total(quantity, price) {
//     var total = parseInt(quantity) * parseInt(price);
//     document.getElementById('pr total_price').innerHTML=total;
// }

$("#checkout-form").submit((e) => {
    e.preventDefault()
    $.ajax({
        url: '/place-order',
        method: 'post',
        //serialize is for acquiring all datas form form
        data: $('#checkout-form').serialize(),
        success: (response) => {
            if (response.codSuccess) {
                location.href = '/order-success'
            } else {
                razorpayPayment(response)
            }
        }
    })
})

function razorpayPayment(order) {
    var options = {
        "key": "rzp_test_ziyUhStIDdkm2B", // Enter the Key ID generated from the Dashboard
        "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": "ANKIT inc",
        "description": "Test Transaction",
        "image": "https://example.com/your_logo",
        "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        "handler": function(response) {
            // alert(response.razorpay_payment_id);
            // alert(response.razorpay_order_id);
            // alert(response.razorpay_signature);

            verifyPayment(response, order)
        },
        "prefill": {
            "name": "Gaurav Kumar",
            "email": "gaurav.kumar@example.com",
            "contact": "9999999999"
        },
        "notes": {
            "address": "Razorpay Corporate Office"
        },
        "theme": {
            "color": "#3399cc"
        }
    };
    var rzp1 = new Razorpay(options);
    rzp1.open();
}

function verifyPayment(payment, order) {
    $.ajax({
        url: '/verify-payment',
        method: 'post',
        data: {
            payment,
            order
        },
        success: (response) => {
            if (response.status) {
                location.href = '/order-success'
            } else {
                alert('failed')
            }
        }
    })

}

function oneClick() {
    // (A) DISABLE THE BUTTON
    document.getElementById("oneClickButton").style.visibility = 'hidden';

    // (B) DO YOUR PROCESSING HERE
    // alert("Something is done!");

    // (C) RE-ENABLE AFTER PROCESSING IF YOU WANT
    // document.getElementById("myButton").disabled = false;
}