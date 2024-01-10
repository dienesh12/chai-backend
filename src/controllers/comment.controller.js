import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if(!videoId) {
        throw new ApiError(400, "Video ID is required")
    }

    const video = await Video.findById(videoId)

    if(!video) {
        throw new ApiError(400, `Video with ID: ${videoId} is not present`)
    }

    const comments = await Comment.find().skip((page - 1) * limit).limit(limit)
                                    .populate("owner", "-password -refreshToken")
                                    .populate("video")

    if(!comments) {
        throw new ApiError(500, `Error while fetching all comments of Video with ID: ${videoId}`)
    }

    return res.status(200).json(
        new ApiResponse(200, comments, "Comments fetched Successfully")
    )
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {content} = req.body
    const {videoId} = req.params

    if(!videoId) {
        throw new ApiError(400, "Video ID is required")
    }

    const video = await Video.findById(videoId)

    if(!video) {
        throw new ApiError(400, `Video with ID: ${videoId} is not present`)
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id
    })

    const createdComment = await Comment.findById(comment._id).populate("owner", "-password -refreshToken")
                                                                .populate("video")

    if(!createdComment) {
        throw new ApiError(500, "Error while Adding new Comment")
    }

    return res.status(201).json(
        new ApiResponse(200, createdComment, "Comment Added Successfully")
    )

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {content} = req.body
    const {commentId} = req.params

    if(!commentId) {
        throw new ApiError(400, "Comment ID is required")
    }

    const comment = await Comment.findById(commentId)

    if(!comment) {
        throw new ApiError(400, `Comment with ID: ${commentId} is not present`)
    }

    const newComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content
            }
        }, {new: true}
    ).populate("video").populate("owner", "-password -refreshToken")

    if(!newComment) {
        throw new ApiError(500, `Error while updating Comment with ID: ${commentId}`)
    }

    return res.status(200).json(
        new ApiResponse(200, newComment, `Comment Updated Successfully`)
    )

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params

    if(!commentId) {
        throw new ApiError(400, "Comment ID is required")
    }

    const comment = await Comment.findById(commentId)

    if(!comment) {
        throw new ApiError(400, `Comment with ID: ${commentId} is not present`)
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId)

    if(!deletedComment) {
        throw new ApiError(500, `Error while deleting comment with ID: ${commentId}`)
    }

    return res.status(200).json(
        new ApiResponse(200, deletedComment, "Comment Deleted Successfully")
    )

})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }
