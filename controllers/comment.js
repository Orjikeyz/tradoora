const express = require("express")
const connection = require("../database/connect")
const json = require("body-parser/lib/types/json")
const sessionAuth = require("./session")

const addComment = async (req, res) => {
    var {product_id, commentText} = req.body

    try {
        if (!sessionAuth.sessionAuthentication(req, res)) return;
        const user_id = req.session.user_id
        const insertCommentQuery = `INSERT INTO comments (product_id, user_id, comment_text) VALUES (?, ?, ?);`;
        const selectCommentQuery = `
                        SELECT 
                            comments.user_id, 
                            users.username, 
                            users.profile_image,
                            comments.created_at
                        FROM comments
                        INNER JOIN users ON users.user_id = comments.user_id
                        WHERE comments.comment_id = ?
        `
        
        if (!product_id || !commentText || !user_id) {
            return res.status(400).json({
                status: "error",
                message: "Input cannot be empty"
            })
        }
    
        connection.query(insertCommentQuery, [product_id, user_id, commentText], (err, insertCommentResult)=> {
            if (err) {
                console.log(err)
            return res.status(500).json({
                    status: "error",
                    message: "Error adding comment. Please try again"
                })
            }

             const insertedCommentId = insertCommentResult.insertId;

            connection.query(selectCommentQuery, [insertedCommentId], (err, selectCommentResult)=> {
                if (err) {
                    console.log(err)
                    return res.status(500).json({
                        status: "error",
                        message: "Error adding comment. Please try again"
                    })
                }
    
                return res.status(200).json({
                    status: "success",
                    message: "Comment added successfully!",
                    username: selectCommentResult[0].username,
                    profile_image: selectCommentResult[0].profile_image,
                    commentText: commentText,
                    created_at: selectCommentResult[0].created_at
                })
            })
        })

    } catch (error) {
        console.error(error); // Log the error for debugging purposes
        return res.status(500).json({
            message: "An error occurred while adding your comment. Please try again later.",
        });
    }
}

const getComments = (req, res)=> {
    let {id} = req.params
    try {
        const getCommentQuery = 
                            `SELECT 
                                comments.comment_id, 
                                comments.product_id, 
                                comments.user_id, 
                                comments.comment_text, 
                                comments.created_at, 
                                users.username, 
                                users.profile_image, 
                                users.user_id 
                            FROM comments 
                            INNER JOIN users ON users.user_id = comments.user_id 
                            WHERE comments.product_id = ? ORDER BY comments.created_at DESC LIMIT 3
                            `;
        connection.query(getCommentQuery, [id], (err, getCommentResult) =>{
            if (err) {
                console.log("An error occurred, while retrieving user profile", err)
            }

            if (getCommentResult.length > 0) {
                return res.json(getCommentResult)
            }else {
                return res.json({
                    status: "error",
                    message: "No comments available"
                })
            }
        }) 
    } catch (error) {
        console.log("An unexpected error occurred", error)
    }
}


const getMoreComments = (req, res)=> {
    let { id, num } = req.params;  // `num` is the number of comments already loaded
    let limit = 3;                 // Number of comments to load at a time
    let offset = parseInt(num, 10); 

    try {
        const getCommentQuery = 
                            `SELECT 
                                comments.comment_id, 
                                comments.product_id, 
                                comments.user_id, 
                                comments.comment_text, 
                                comments.created_at, 
                                users.username, 
                                users.profile_image, 
                                users.user_id 
                            FROM comments 
                            INNER JOIN users ON users.user_id = comments.user_id 
                            WHERE comments.product_id = ? ORDER BY comments.created_at DESC LIMIT ? OFFSET ?
                            `;
        connection.query(getCommentQuery, [id, limit, offset], (err, getCommentResult) =>{
            if (err) {
                console.log("An error occurred, while retrieving user profile", err)
            }
            console.log(num)
            if (getCommentResult.length > 0) {
                return res.json(getCommentResult)
            }else {
                return res.json({
                    status: "error",
                    message: "No comments available"
                })
            }
        }) 
    } catch (error) {
        console.log("An unexpected error occurred", error)
    }
}
module.exports = {
    addComment,
    getComments,
    getMoreComments
}

