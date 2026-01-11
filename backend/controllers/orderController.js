import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// placing user order from frontend
const placeOrder = async (req, res) => {

    const frontend_url = "http://localhost:5174";

    try {
        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address,
        })
        await newOrder.save();

        // after saving the order, clean the users cart data
        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

        const lineItems = req.body.items.map((item) => ({ // this is necessary for stripe payment
            price_data: {
                currency: "usd",
                product_data: {
                    name: item.name
                },
                unit_amount: item.price * 100
            },
            quantity: item.quantity
        }))

        lineItems.push({
            price_data: {
                currency: "usd",
                product_data: {
                    name: "Delivery Charges"
                },
                unit_amount: 2 * 100
            },
            quantity: 1
        })

        const session = await stripe.checkout.sessions.create({
            line_items: lineItems,
            mode: 'payment',
            success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
        })

        res.json({success: true, session_url: session.url})
    } catch (error) {
        console.log(error);
        res.json({success: false, message: "Error"});
    }
}

const verifyOrder = async (req, res) => {
    const { orderId, success } = req.body;
    try {
        if (success === "true") {
            await orderModel.findByIdAndUpdate(orderId, {payment: true});
            res.json({success: true, message: "Paid"})
        } else {
            await orderModel.findByIdAndDelete(orderId);
            res.json({success: false, message: "Not Paid"})
        }
    } catch (error) {
        console.log(error);
        res.json({success: false, message: "Error"})
    }
}

// user orders for frontend
const userOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({userId: req.body.userId}); // get all the orders for this user id
        res.json({success: true, data: orders})
    } catch (error) {
        console.log(error);
        res.json({success: false, message: "Error"})
    }
}

// Listing orders for admin panel
const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({}); // using this we'll get all the orders in this variable
        res.json({success: true, data: orders});
    } catch (error) {
        console.log(error);
        res.json({success: false, message: "Error"})
    }
}

// api for updating order status
const updateStatus = async (req, res) => {
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId, {status: req.body.status});
        res.json({success: true, message: "Status Updated"})
    } catch (error) {
        console.log(error);
        res.json({success: false, message: "Error"})
    }
}

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus }