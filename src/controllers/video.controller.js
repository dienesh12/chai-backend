import fs from "fs"
import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"

/* 
EXTRA:

1) Upload Multiple Videos
*/

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    // console.log(req.files);
    // res.status(200).json("Success!")

    if(!title || !description) {
        throw new ApiError(400, "Please title and description for your Video!")
    }

    const videoLocalPath = req.files?.videoFile[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path

    const videoFile = await uploadOnCloudinary(videoLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: videoFile.duration,
        owner: req.user._id
    })

    const createdVideo = await Video.findById(video._id).populate(
        "owner",
        "-password -refreshToken"
    )

    if(!createdVideo) {
        throw new ApiError(500, "Something went wrong while publishing the video")
    }

    return res.status(201).json(
        new ApiResponse(200, createdVideo, "Video Published Successfully")
    )

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    if(!videoId) {
        throw new ApiError(400, "Please provide video ID")
    }

    const video = await Video.findById(videoId)
    if(!video) {
        throw new ApiError(400, `Video with ID: ${videoId} is not present`)
    }

    return res.status(200).json(
        new ApiResponse(200, video, `Sending video with ID: ${videoId}`)
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

    if(!videoId) {
        throw new ApiError(400, "Please provide video ID")
    }

    const video = await Video.findById(videoId)
    if(!video) {
        throw new ApiError(400, `Video with ID: ${videoId} is not present`)
    }

    const {title, description} = req.body
    if(!title && !description && !req.files) {
        throw new ApiError(400, "Update atleast one field")
    }

    let thumbnail = video.thumbnail
    if(req.files) {
        const thumbnailLocalPath = req.files?.thumbnail[0]?.path
        
        let res = await uploadOnCloudinary(thumbnailLocalPath)
        thumbnail = res.url
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title,
                description,
                thumbnail
            }
        }, {new: true}
    )

    if(!updatedVideo) {
        throw new ApiError(500, "Error while updating the video")
    }

    return res.status(200).json(
        new ApiResponse(200, updatedVideo, "Video Updated Successfully")
    )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    if(!videoId) {
        throw new ApiError(400, "Please provide video ID")
    }

    const video = await Video.findById(videoId)
    if(!video) {
        throw new ApiError(400, `Video with ID: ${videoId} is not present`)
    }

    try {
        await Video.deleteOne({ "_id": videoId });
    } catch(error) {
        throw new ApiError(500, "Error while deleting video")
    }

    return res.status(200).json(
        new ApiResponse(200, videoId, `Video with ID: ${videoId} deleted successfully`)
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!videoId) {
        throw new ApiError(400, "Please provide video ID")
    }

    const video = await Video.findById(videoId)
    if(!video) {
        throw new ApiError(400, `Video with ID: ${videoId} is not present`)
    }

    const toggledVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: !isPublished
            }
        }
    )

    if(!toggledVideo) {
        throw new ApiError(500, "Erro while toggling Publish Status")
    }

    return res.status(200).json(
        new ApiResponse(200, toggledVideo, `Publish Status of video with ID: ${videoId} toggled successfully`)
    )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
