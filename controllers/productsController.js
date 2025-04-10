const express = require("express")
const connection = require("../database/connect")
const json = require("body-parser/lib/types/json")
const sessionAuth = require("./session")

//Get all products items 
const getAllProducts = async (req, res) => {
    try {
        if (!sessionAuth.sessionAuthentication(req, res)) return;
        const user_id = req.session.user_id

        const getCartVendorsItems = await getAllVendors()

        const allProductQuery = `SELECT * FROM products ORDER BY created_at DESC, RAND()`
        connection.query(allProductQuery, (err, allProductResult) => {
            const allProducts = JSON.parse(JSON.stringify(allProductResult))

            if (err) {
                res.status(500).json({
                    status: "Error",
                    message: "Error getting al products"
                })
            }

            res.render("index", {
                allProducts: allProducts,
                getCartVendorsItems: getCartVendorsItems
            })

        })

    } catch (error) {
        console.error("Sorry an error occurred.", error)
    }
}



//Get product based on ID
const getProduct = async (req, res) => {
    const product_id = req.params.id
    if (!sessionAuth.sessionAuthentication(req, res)) return;
    const user_id = req.session.user_id
    const getProductCommentItems = await getProductComment(product_id)

    const getProductQuery = `SELECT products.*, users.phone FROM products
                            INNER JOIN users ON users.username = products.posted_by
                            WHERE products.id = ?
    `
    connection.query(getProductQuery, [product_id], (err, getProductResult) => {
        const getProductitems = getProductResult
        // const getProductitems = JSON.parse(JSON.stringify(getProductResult))

        if (err) {
            console.log(err)
            return res.status(500).render("error", {
                status: "Error",
                message: "Error getting product"
            })
        }

        if (getProductitems.length <= 0) {
            return res.status(404).render("404", {
                status: "Error",
                message: "Invalid product "
            })
        }
        res.render("product_view", {
            getProductitems: getProductitems[0],
            product_id: product_id,
            getProductCommentItems: getProductCommentItems
        })
    })
}

const getProductComment = (id) => {
    return new Promise((resolve, reject)=> {
        try {
            const getProductCommentQuery = "SELECT comments.product_id, comments.comment_text, comments.created_at, comments.user_id FROM comments WHERE comments.product_id = ? ORDER BY created_at DESC ";
            connection.query(getProductCommentQuery, [id], (err, getProductCommentResult)=> {
                if (err) {
                    console.log("Error getting comment data", err)
                    return reject(err)
                }

                const  getProductCommentItems = JSON.parse(JSON.stringify(getProductCommentResult))
                return resolve(getProductCommentItems)
            })
        } catch (error) {
            console.log("An unexpected error occurred", error)
            reject(error)
        }
    })
}

const getAllVendors = (req, res) => {
    return new Promise((resolve, reject) => {
        try {
            const getAllVendorsQuery = `SELECT users.username, users.vendor_status, users.user_id, users.profile_image, users.business_name, products.id, COUNT(products.id) AS total_products 
                                        FROM users 
                                        LEFT JOIN products ON products.posted_by = users.username
                                        WHERE users.role = ? GROUP BY users.username ORDER BY RAND()`;
            connection.query(getAllVendorsQuery, ["vendor"], (err, getAllVendorsResult) => {
                const getAllVendorsItems = JSON.parse(JSON.stringify(getAllVendorsResult))
                if (err) {
                    console.error("Error Getting All Vendors Details", err)
                    return reject(err)
                }
                resolve(getAllVendorsItems)
            })
        } catch (error) {
            reject(error)
            return res.status(500).json({
                status: "error",
                message: "An unexpected error occurred"
            });
        }
    })
}

//Get all SearchProduct Section 
const SearchProduct = async (req, res) => {
    try {
        if (!sessionAuth.sessionAuthentication(req, res)) return;
        const user_id = req.session.user_id


        const getCartVendorsItems = await getAllVendors()

        const allProductQuery = `SELECT * FROM products ORDER BY created_at DESC, RAND() LIMIT 100`
        connection.query(allProductQuery, (err, allProductResult) => {
            const allProducts = JSON.parse(JSON.stringify(allProductResult))

            if (err) {
                res.status(500).json({
                    status: "Error",
                    message: "Error getting all products"
                })
            }

            res.render("products", {
                allProducts: allProducts,
                getCartVendorsItems: getCartVendorsItems
            })

        })

    } catch (error) {
        console.error("Sorry an error occurred.", error)
    }
}

const searchQuery = (req, res) => {
    const {
        query
    } = req.body
    if (!sessionAuth.sessionAuthentication(req, res)) return;
    const user_id = req.session.user_id


    try {
        const searchValue = `%${query}%`
        const searchItemQuery = `SELECT id, name FROM products WHERE name LIKE ? OR posted_by LIKE ? OR description LIKE ? LIMIT 10`
        connection.query(searchItemQuery, [searchValue, searchValue, searchValue], (err, searchItemResult) => {
            if (err) {
                res.status(500).json({
                    status: "Error",
                    message: "Error getting search items"
                })
            }
            let searchQueryItems = JSON.parse(JSON.stringify(searchItemResult))
            res.status(200).json(searchQueryItems)
        })
    } catch (error) {
        console.error("Sorry an error occurred.", error)
    }
}

const categoryPage = (req, res) => {
    if (!sessionAuth.sessionAuthentication(req, res)) return;
    const user_id = req.session.user_id

    res.render('category')
}

const categoryProduct = (req, res) => {
    const {
        query
    } = req.body
    if (!sessionAuth.sessionAuthentication(req, res)) return;
    const user_id = req.session.user_id


    try {
        const categoryProductQuery = "SELECT * FROM products WHERE category = ? ORDER BY created_at DESC"
        connection.query(categoryProductQuery, [query], (err, categoryProductResult) => {
            if (err) {
                res.status(500).json({
                    status: "Error",
                    message: "Error getting category items"
                })
            }
            let categoryProductItems = JSON.parse(JSON.stringify(categoryProductResult))
            res.status(200).json(categoryProductItems)
        })
    } catch (error) {
        console.error("Sorry an error occurred.", error)
    }
}
module.exports = {
    getAllProducts,
    getProduct,
    SearchProduct,
    categoryProduct,
    categoryPage,
    searchQuery
}