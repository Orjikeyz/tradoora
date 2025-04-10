var express = require("express")
var connection = require("../../database/connect")
const { json } = require("body-parser")

/**
 * Retrieves the total number of customers (vendor follows) for a given vendor.
 * 
 * This function executes an SQL query to count how many customers are following a specific vendor
 * identified by the provided `user_id`. The result is returned as a promise, and in case of an error, 
 * it is rejected. If no data is found, the count is returned as 0.
 * 
 * @param {string} user_id - The unique identifier for the vendor.
 * @returns {Promise<number>} - A promise that resolves to the total count of customers following the vendor.
 * @throws {Error} - If an error occurs during the query execution, the promise is rejected.
 */
const getAllVendorsCustomers = async (user_id) => {
    try {
        return new Promise((resolve, reject) => {
            const getAllVendorsCustomersQuery = "SELECT COUNT(*) vendorsCount FROM vendor_follows WHERE vendor_id = ?"
            connection.query(getAllVendorsCustomersQuery, [user_id], (err, getAllVendorsCustomersResult) => {
                if (err) {
                    console.log("Error getting all vendors customers data")
                    reject(err)
                }
                let getAllVendorsCustomersData = JSON.parse(JSON.stringify(getAllVendorsCustomersResult))

                if (getAllVendorsCustomersData.length === 0) {
                    getAllVendorsCustomersData = 0
                }

                return resolve(getAllVendorsCustomersData)
            })
        })
    } catch (error) {
        console.log("An unexpected error occurred while processing your request. Please try again later.")
        return Promise.reject(error);
    }
}

/**
 * Retrieves the total number of products listed by a specific vendor.
 * 
 * This function executes an SQL query to count how many products are associated with a given vendor 
 * identified by the `user_id`. The result is returned as a promise. If an error occurs during the query, 
 * the promise is rejected. If no products are found, the count is returned as 0.
 * 
 * @param {string} user_id - The unique identifier for the vendor.
 * @returns {Promise<number>} - A promise that resolves to the total count of products listed by the vendor.
 * @throws {Error} - If an error occurs during the query execution, the promise is rejected.
 */
const getAllVendorsProducts = (user_id) => {
    try {
        return new Promise((resolve, reject) => {
            const getAllVendorsProductsQuery = "SELECT COUNT(*) productCount FROM products WHERE posted_by = ?"
            connection.query(getAllVendorsProductsQuery, [user_id], (err, getAllVendorsProductsResult) => {
                if (err) {
                    console.log("Error getting all vendors products data")
                    reject(err)
                }
                let getAllVendorsProductsData = JSON.parse(JSON.stringify(getAllVendorsProductsResult))

                if (getAllVendorsProductsData.length === 0) {
                    getAllVendorsProductsData = 0
                }

                return resolve(getAllVendorsProductsData)
            })
        })
    } catch (error) {
        console.log("An unexpected error occurred while processing your request. Please try again later.")
        // return Promise.reject(error);
    }
}

const getRecentProducts = (user_id) => {
    try {
        return new Promise((resolve, reject)=> {
            const getRecentProductsQuery = "SELECT products.name, products.image_urls, products.price, products.currency FROM products WHERE posted_by = ? ORDER BY created_at DESC LIMIT 5";
            connection.query(getRecentProductsQuery, [user_id], (err, getRecentProductsResult)=> {
                if (err) {
                    console.log("Error getting recent products data")
                    reject(err)
                }

                let getRecentProductsData = JSON.parse(JSON.stringify(getRecentProductsResult))
                return resolve(getRecentProductsData)
            })
        })
    } catch (error) {
        console.log(error)
        throw error
    }   
}

const index = async (req, res) => {
    // if (!sessionAuth.sessionAuthentication(req, res)) return;
    // if (!sessionAuth.sessionVendorAuthentication(req, res)) return;
    // const user_id = req.session.user_id
    const user_id = "xcode"
    const getAllVendorsCustomersData = await getAllVendorsCustomers(user_id)
    const getAllVendorsProductsData = await getAllVendorsProducts(user_id)
    const getRecentProductsData = await getRecentProducts(user_id)
    try {
    
        res.status(200).render("vendor/index", {
            getAllVendorsCustomersData: getAllVendorsCustomersData[0].vendorsCount,
            getAllVendorsProductsData: getAllVendorsProductsData[0].productCount,
            getRecentProductsData: getRecentProductsData

        })
    } catch (error) {
        console.log("Error occurred:", error);
        return res.status(500).json({
            status: "Error",
            message: "An unexpected error occurred while processing your request. Please try again later."
        });
    }
}

module.exports = {
    index
}