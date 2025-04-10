var express = require("express")
var connection = require("../../database/connect")
var sessionAuth = require("../session")

const multer = require("multer");
const { categoryPage } = require("../productsController");
const upload = multer();

const Allproducts = (req, res) => {
    // if (!sessionAuth.sessionAuthentication(req, res)) return;
    // if (!sessionAuth.sessionVendorAuthentication(req, res)) return;
    // const user_id = req.session.user_id
    const user_id = "xcode"

    try {
        const allProductsQuery = `SELECT * FROM products WHERE product_user_id = ? ORDER BY created_at DESC`
        connection.query(allProductsQuery, [user_id], (err, allProductResult) => {
            if (err) {
                return res.status(500).render("error", {
                    status: "Error",
                    message: "Error getting product items"
                })
            }

            let allProductItems = JSON.parse(JSON.stringify(allProductResult))
            // console.log(allProductItems)
            res.status(200).render("vendor/product-list", {
                allProductItems: allProductItems
            })

        })
    } catch (error) {
        res.status(500).render("error", {
            status: "Error",
            message: "An unexpected error occurred while processing your request. Please try again later."
        })
    }
}

const addProduct = (req, res) => {
    if (!sessionAuth.sessionAuthentication(req, res)) return;
    if (!sessionAuth.sessionVendorAuthentication(req, res)) return;
    const user_id = req.session.user_id

    try {
        const categoryQuery = "SELECT name FROM category";
        connection.query(categoryQuery, (err, categoryResult) => {
            if (err) {
                res.status(500).json({
                    status: "Error",
                    message: "Error Getting Category Data."
                })
            }

            let categoryItems = JSON.parse(JSON.stringify(categoryResult))
            console.log(categoryItems)
            res.render("vendor/add-product.ejs", {
                categoryItems: categoryItems
            })
        })
    } catch (error) {
        res.status(500).json({
            status: "Error",
            message: "An unexpected error occurred while processing your request. Please try again later."
        })
    }
}

const addProductData = (req, res) => {

    if (!sessionAuth.sessionAuthentication(req, res)) return;
    if (!sessionAuth.sessionVendorAuthentication(req, res)) return;
    const user_id = req.session.user_id

    // Generate RefId
    function generateRefID(length = 6) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let refID = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            refID += characters[randomIndex];
        }
        return refID;
    }

    const filenames = req.files.map(file => file.filename);
    const {
        name,
        category,
        price,
        description
    } = req.body
    const uploadQuery = "INSERT INTO products (name, category, price, description, product_user_id, ref_id, image_urls) VALUES (?,?,?,?,?,?,?)"

    // Convert filenames to JSON for storing
    const imageUrlsJson = JSON.stringify(filenames);
    const refID = generateRefID();

    try {
        connection.query(uploadQuery, [name, category, price, description, user_id, refID, imageUrlsJson], (err, uploadResult) => {
            if (err) {
                res.status(500).json({
                    status: "Error",
                    message: "Error Uploading Product Data."
                })
            }

            // Check if required fields are provided
            if (!name || !category || !price || !description) {
                return res.status(400).json({
                    status: "Error",
                    message: "All fields are required.",
                });
            }

            // Validate price is a valid number
            if (isNaN(price) || price <= 0) {
                return res.status(400).json({
                    status: "Error",
                    message: "Price must be a valid positive number.",
                });
            }

            // Check if files are uploaded
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({
                    status: "Error",
                    message: "At least one image must be uploaded.",
                });
            }

            res.status(200).json({
                status: "success",
                message: "Product data uploaded successfully."
            })

        })
    } catch (error) {
        res.status(500).json({
            status: "Error",
            message: "An unexpected error occurred while processing your request. Please try again later."
        })
    }

}

const editProduct = async (req, res) => {
    // if (!sessionAuth.sessionAuthentication(req, res)) return;
    // if (!sessionAuth.sessionVendorAuthentication(req, res)) return;
    // const user_id = req.session.user_id
    const user_id = "xcode";
    const {id} = req.params

    try {
        let getEditProductItem = await getEditProductData(req, res, id)
        if (getEditProductItem.length === 0 || getEditProductData.length === "") {
            return res.status(404).render("vendor/product-list", {
                message: "Product not found",
            });
        }

        const categoryQuery = "SELECT name FROM category";
        connection.query(categoryQuery, (err, categoryResult) => {
            if (err) {
                return res.status(500).json({
                    status: "Error",
                    message: "Error Getting Category Data."
                })
            }

            let categoryItems = JSON.parse(JSON.stringify(categoryResult))
            res.render("vendor/edit-product", {
                categoryItems: categoryItems,
                getEditProductItem: getEditProductItem
            })
        })
    } catch (error) {
        res.status(500).json({
            status: "Error",
            message: "An unexpected error occurred while processing your request. Please try again later."
        })
    }
}

const getEditProductData = async (req, res, id) => {
    return new Promise((resolve, reject) => {
        const getEditProductQuery = "SELECT products.name, products.category, products.price, products.description, products.image_urls FROM products WHERE id = ?";
        try {
            console.log(id)
            connection.query(getEditProductQuery, [id], (err, getEditProductResult) => {
                if (err) {
                    return reject(err)
                }

                if (getEditProductResult.length === 0) {
                    return reject([])
                }

                let getEditProductItem = JSON.parse(JSON.stringify(getEditProductResult))
                console.log(getEditProductItem)
                return resolve(getEditProductItem)
            })
        } catch (error) {
            console.log(error)
            return reject(error)
        }
    })
}

const deleteProduct = (req, res) => {
    if (!sessionAuth.sessionAuthentication(req, res)) return;
    if (!sessionAuth.sessionVendorAuthentication(req, res)) return;
    const user_id = req.session.user_id

    // Extract product ID from request parameters
    const { id } = req.params;
    const { idArray } = req.body;

    // Check if idArray is undefined (Single product delete)
    if (typeof idArray === "undefined") {
        // SQL query to delete a single product by ID
        const deleteProductQuery = "DELETE FROM products WHERE id = ?";

        // Validate that ID is provided
        if (!id) {
            return res.status(400).json({
                status: "Error",
                message: "Product ID is required"
            });
        }

        try {
            // Execute the SQL query to delete the product
            connection.query(deleteProductQuery, [id], (err, deleteProductResult) => {
                if (err) {
                    // Handle database error case
                    return res.status(500).json({
                        status: "error",
                        message: "Error Deleting Product item"
                    });
                }

                // Log the result and send a success response
                console.log(deleteProductResult);
                return res.status(200).json({
                    status: "success",
                    message: "Product Deleted Successfully"
                });
            });
        } catch (error) {
            // Catch and handle unexpected server errors
            console.error("Unexpected error deleting product:", error);
            return res.status(500).json({
                status: "Error",
                message: "An unexpected error occurred while deleting the product."
            });
        }
    } else {
        // Convert array of IDs into a string format for SQL (e.g., '1', '2', '3')
        let idArrayGroup = idArray.map(id => `'${id}'`).join(', ');

        // SQL query to delete multiple products using the IN clause
        const deleteProductQuery = `DELETE FROM products WHERE id IN (${idArrayGroup})`;

        // Validate that at least one ID is provided
        if (!id) {
            return res.status(400).json({
                status: "Error",
                message: "Product ID is required"
            });
        }

        try {
            // Execute the SQL query to delete multiple products
            connection.query(deleteProductQuery, [id], (err, deleteProductResult) => {
                if (err) {
                    // Handle database errors
                    return res.status(500).json({
                        status: "error",
                        message: "Error Deleting Product item"
                    });
                }

                // Log the result and send a success response
                console.log(deleteProductResult);
                return res.status(200).json({
                    status: "success",
                    message: "Product Deleted Successfully"
                });
            });
        } catch (error) {
            // Catch and handle unexpected server errors
            console.error("Unexpected error deleting product:", error);
            return res.status(500).json({
                status: "Error",
                message: "An unexpected error occurred while deleting the product."
            });
        }

        // Log the received ID array for debugging
        console.log(idArray, id, "Array is undefined");
    }
};


module.exports = {
    Allproducts,
    addProduct,
    addProductData,
    editProduct,
    deleteProduct
}