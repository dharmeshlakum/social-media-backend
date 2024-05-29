import express from "express";
import tokenValidationMW from "../../Middlewares/TokenValidationMiddleware.js";
import { collectionNameValidation, postIDvalidationMW } from "../../Middlewares/IDvalidationMiddlewares.js";
import savePostModel from "../../Models/SavedPost/SavedPostCollection.js";
import userModel from "../../Models/User/UserCollection.js";
import { collectionAuthorizationMW } from "../../Middlewares/Authorization.js";

const savepostRouter = express.Router();

//Save Post
savepostRouter.post("/save-post/:postId", tokenValidationMW, postIDvalidationMW, async (req, res) => {

    try {
        const { validation, post } = req;

        if (!validation) return res.status(401).json({ error: "Token is missing" });
        if (!post) return res.status(404).json({ error: "Post not found" });

        const userCollection = await savePostModel.findOne({ userId: validation.id, name: "All Posts" });
        if (userCollection) {

            const postdata = await savePostModel.findOne({ _id: userCollection._id, posts: { $in: [post._id] } });
            if (postdata) {
                await savePostModel.updateOne({ _id: postdata._id }, {
                    $pull: { posts: post._id }
                });

                res.status(200).json({
                    status: "Success",
                    message: "Post remove successfully"
                })

            } else {
                await savePostModel.updateOne({ _id: userCollection._id }, {
                    $push: { posts: post._id }
                });

                res.status(200).json({
                    status: "Success",
                    message: "Post added successfully"
                })
            }

        } else {
            console.log("else part");
            const newCollection = new savePostModel({
                userId: validation.id,
                name: "All Posts",
                posts: post._id
            });
            await newCollection.save();
            await userModel.updateOne({ _id: validation.id }, {
                $push: { savedPost: newCollection._id }
            });

            res.status(200).json({
                status: "Success",
                message: "Post added successfully inside the collection"
            });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

//Create Collection
savepostRouter.post("/save-post/new/create-collection", tokenValidationMW, async (req, res) => {

    try {
        const { collection } = req.body;
        const { validation } = req;
        if (!collection) return res.status(400).json({ error: "Collection name is required" });

        const newCollection = new savePostModel({
            userId: validation.id,
            name: collection,
        });
        const collectionSave = await newCollection.save();
        await userModel.updateOne({ _id: validation.id }, {
            $push: { savedPost: collectionSave._id }
        });

        res.status(200).json({
            status: "Success",
            message: `${collection} - created successfully`
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

//Delete Collection
savepostRouter.delete("/save-post/delete/collection/:collectionName", tokenValidationMW, collectionNameValidation, collectionAuthorizationMW, async (req, res) => {

    try {
        const { collection, validation } = req;
        await userModel.updateOne({ _id: validation.id }, {
            $pull: { savedPost: collection._id }
        });
        await savePostModel.deleteOne({ _id: collection._id });

        res.status(200).json({
            status: "Success",
            message: "Collection is deleted successfully"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

//Add Post To Collections
savepostRouter.post("/save-post/:postId/:collectionName", tokenValidationMW, postIDvalidationMW, collectionNameValidation, collectionAuthorizationMW, async (req, res) => {

    try {
        const { collection, post, validation } = req;
        const postData = await savePostModel.findOne({
            _id: collection._id,
            posts: {
                $in: [post._id]
            }
        });

        if (postData) {
            await savePostModel.updateOne({ _id: postData._id }, {
                $pull: { posts: post._id }
            });

            res.status(200).json({
                status: "Success",
                message: `Post removed from ${collection.name}`
            });

        } else {
            await savePostModel.updateOne({ _id: collection._id }, {
                $push: { posts: post._id }
            });

            const allData = await savePostModel.findOne({
                userId: validation.id,
                name: "All Posts",
                posts: {
                    $in: [post._id]
                }
            });

            if (!allData) {
                await savePostModel.updateOne({ userId: validation.id, name: "All Posts" }, {
                    $push: { posts: post._id }
                })
            }

            res.status(200).json({
                status: "success",
                message: `post added to ${collection.name}`
            })

        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

export default savepostRouter;