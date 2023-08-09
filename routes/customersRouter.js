const express = require("express");
const customerRouter = express.Router();
const {body, validationResult} = require("express-validator");

const Customer = require("../models/customerModel");

const validations = [
    body('firstname').notEmpty().withMessage("First Name is required!"),
    body('lastname').notEmpty().withMessage("Last Name is required!"),
    body('city').notEmpty().withMessage("City is required!"),
    body('company').notEmpty().withMessage("Company is required!")
];

const createCustomer = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
    try {
        const {firstname, lastname, city, company} = req.body;

        const existingCustomer = await Customer.findOne({firstname:firstname, lastname:lastname});
        if(existingCustomer){
            throw new Error("Customer already exist");
        }

        const newCustomer = new Customer({
            firstname,
            lastname, city, company
        });
        await newCustomer.save();

        res.status(200).send({
            status:"success",
            data: newCustomer
        });

    } catch(e){
        res.status(500).send({
            status:"failed",
            message: e.message
        })
    }
}

const getCustomer = async (req, res) => {
    try {
        let id = req.params.customerId;
        const customer = await Customer.findById(id);

        res.status(200).send({
            status:"success",
            data: customer
        })
    } catch(e) {
        res.status(500).send({
            status:"failed",
            message:e.message
        })
    }
}

const getUniqueCities = async (req, res) => {
    try {
        const cityCustomers = await Customer.aggregate([
            {
                $group : {
                    _id: '$city',
                    count: {$sum: 1}
                }
            },
            {
                $project: {
                    _id: 0,
                    city: '$_id',
                    count: 1
                }
            }
        ]);

        res.status(200).json(cityCustomers);
    } catch(e) {
        res.status(500).send({
            status:"failed",
            message:e.message
        })
    }
}

const getCustomerByQuery = async (req, res) => {
    try {
        const {page=1, limit=10, firstname, lastname, city} = req.query;
        const query = {};
        if(firstname) query.firstname = new RegExp(firstname, 'i');
        if(lastname) query.lastname = new RegExp(lastname, 'i');
        if(city) query.city = new RegExp(city, 'i');

        const items = await Customer.find(query)
            .limit(limit*1)
            .skip((page-1)*limit)
            .exec();

        res.json(
            items
        );
    } catch(e) {
        res.status(500).send({
            status:"failed",
            message:e.message
        })
    }   
}

const updateCustomer = async (req, res) => {
    try {
        const id = req.params.customerId;
        const {firstname, lastname} = req.body;

        const existingCustomer = await Customer.findById(id);

        if(!existingCustomer){
            throw new Error("Customer not found");
        }

        if(firstname) existingCustomer.firstname = firstname;
        if(lastname) existingCustomer.lastname = lastname;

        await existingCustomer.save();

        res.status(200).send({
            status:"success",
            message:"Customer updated successfully!",
            data: existingCustomer
        })
    } catch(e) {
        res.status(500).send({
            status:"failed",
            message:e.message
        })
    }
}

const deleteCustomer = async (req, res) => {
    try{
        const id = req.params.customerId;
        const existCustomer = await Customer.findById(id);

        if(!existCustomer){
            throw new Error("Customer does not exist");
        }

        await Customer.deleteOne({_id: id});

        res.status(200).send({
            status:"success",
            message:"Successfully deleted customer"
        })
    } catch(e) {
        res.status(500).send({
            status:"failed",
            message:e.message
        })
    } 
}

customerRouter.post("/", validations, createCustomer);
customerRouter.get("/cities/", getUniqueCities);
customerRouter.get("/query", getCustomerByQuery);
customerRouter.get("/:customerId", getCustomer);
customerRouter.put("/:customerId", updateCustomer);
customerRouter.delete("/:customerId", deleteCustomer);

module.exports = customerRouter;