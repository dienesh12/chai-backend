import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video

    if(!videoId) {
        throw new ApiError(400, "Video ID is required")
    }

    const userId = req.user._id

    const isLiked = await Like.find({
        $and: [
            { video: new mongoose.Types.ObjectId(videoId) },
            { likedBy: new mongoose.Types.ObjectId(userId) }
        ]
    })

    let updatedVideo
    let message

    if(isLiked.length > 0) {
        message = "disliked"
        updatedVideo = await Like.findByIdAndDelete(isLiked[0]._id)
    }
    else {
        message = "liked"
        updatedVideo = await Like.create({
            video: videoId,
            likedBy: userId
        })
    }

    if(!updatedVideo) {
        throw new ApiError(500, `Error while toggling Video with ID: ${videoId} by User with ID: ${userId}`)
    }

    return res.status(200).json(
        new ApiResponse(200, updatedVideo, `Video ${message} Successfully`)
    )

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

    if(!commentId) {
        throw new ApiError(400, "Comment ID is required")
    }

    const userId = req.user._id

    const isLiked = await Like.find({
        $and: [
            { comment: new mongoose.Types.ObjectId(commentId) },
            { likedBy: new mongoose.Types.ObjectId(userId) }
        ]
    })

    let updatedComment
    let message

    if(isLiked.length > 0) {
        message = "disliked"
        updatedComment = await Like.findByIdAndDelete(isLiked[0]._id)
    }
    else {
        message = "liked"
        updatedComment = await Like.create({
            comment: commentId,
            likedBy: userId
        })
    }

    if(!updatedComment) {
        throw new ApiError(500, `Error while toggling Comment with ID: ${commentId} by User with ID: ${userId}`)
    }

    return res.status(200).json(
        new ApiResponse(200, `Comment ${message} Successfully`)
    )
    
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet

    if(!tweetId) {
        throw new ApiError(400, "Tweet ID is required")
    }

    const userId = req.user._id

    const isLiked = await Like.find({
        $and: [
            { tweet: new mongoose.Types.ObjectId(tweetId) },
            { likedBy: new mongoose.Types.ObjectId(userId) }
        ]
    })

    let updatedTweet
    let message

    if(isLiked.length > 0) {
        message = "disliked"
        updatedTweet = await Like.findByIdAndDelete(isLiked[0]._id)
    }
    else {
        message = "liked"
        updatedTweet = await Like.create({
            tweet: tweetId,
            likedBy: userId
        })
    }

    if(!updatedTweet) {
        throw new ApiError(500, `Error while toggling Tweet with ID: ${tweetId} by User with ID: ${userId}`)
    }

    return res.status(200).json(
        new ApiResponse(200, `Tweet ${message} Successfully`)
    )

})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const allLikedVideos = await Like.aggregate([
        {
            $match: {
                video: { $ne: null }
            }
        },
        {
            $lookup: {
                from: 'videos',
                localField: 'video',
                foreignField: '_id',
                as: 'likedVideos',
            }
        }
    ])

    if(!allLikedVideos) {
        throw new ApiError(500, `Error while fetching all liked videos`)
    }

    return res.status(200).json(
        new ApiResponse(200, allLikedVideos, 'Fetched all liked videos successfully')
    )

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}