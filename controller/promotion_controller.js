const { validationResult } = require('express-validator');


const HttpError = require('../models/http_error');
const Promotion = require('../models/promotion');
const HttpSuccess = require('../models/http_success');
const { uploadBufferToCloudinary } = require('../middleware/file_upload');

const GetAllPromotions = async (req, res, next) => {
    console.log("GET request received");
    try {
        const promotions = await Promotion.find();
        if (!promotions) {
            return next(new HttpError('No promotions found', 404));
        }
        res.status(200).json(new HttpSuccess('Promotions fetched successfully', promotions));
    } catch (err) {
        return next(new HttpError('Fetching promotions failed, please try again later.', 500));
    }
};

const GetPromotionById = async (req, res, next) => {
    console.log("GET request received");
    const { id } = req.params;
    let promotion;
    try {
        promotion = await Promotion.findById(id);
    } catch (err) {
        return next(new HttpError('Fetching promotion failed, please try again later.', 500));
    }
    res.status(200).json(new HttpSuccess('Promotion fetched successfully', promotion));
};

const CreatePromotion = async (req, res, next) => {
    console.log("POST request received");

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError(errors.array()[0].msg, 422, errors.array()));
    }
    const {
        title,
        description,
        discountType,
        discountValue,
        startAt,
        endAt,
        active
    } = req.body;

    if (!req.file) {
        return next(new HttpError('Image is required', 422));
    }


    let imageUrl = '';
    let publicId = '';

    try {
        const uploadResult = await uploadBufferToCloudinary(req.file.buffer);
        imageUrl = uploadResult.secure_url;   // HTTPS URL (recommended)
        publicId = uploadResult.public_id;    // Save this for future deletion

        console.log("Cloudinary upload successful:", uploadResult);
    } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return next(new HttpError('Failed to upload image to Cloudinary', 500));
    }

    const promotion = new Promotion({
        title,
        description,
        discountType,
        discountValue,
        imageUrl,          // Now comes from Cloudinary
        publicId,          // ← Recommended to save for later deletion
        startAt,
        endAt,
        active
    });

    try {
        await promotion.save();
        res.status(201).json(new HttpSuccess('Promotion created successfully', promotion));
    } catch (err) {
        if (publicId) {
            try {
                await cloudinary.uploader.destroy(publicId);
            } catch (deleteErr) {
                console.error("Failed to delete image from Cloudinary:", deleteErr);
            }
        }
        return next(new HttpError('Creating promotion failed, please try again later.', 500));
    }
};

const UpdatePromotion = async (req, res, next) => {
    console.log("PATCH request received");
    const { id } = req.params;
    const {
        title,
        description,
        discountType,
        discountValue,
        startAt,
        endAt,
        active
    } = req.body;

    let updatedPromotion;
    try {
        updatedPromotion = await Promotion.findById(id);
        if (!updatedPromotion) {
            return next(new HttpError('Promotion not found', 404));
        }

    } catch {
        return next(new HttpError('Fetching promotion failed, please try again later.', 500));
    }

    let updatedImageUrl = updatedPromotion.imageUrl;
    let updatedPublicId = updatedPromotion.publicId;

    if (req.file) {
        try {
            if (updatedPromotion.publicId) {
                await cloudinary.uploader.destroy(updatedPromotion.publicId);
            }
            const uploadResult = await uploadBufferToCloudinary(req.file.buffer);
            updatedImageUrl = uploadResult.secure_url;
            updatedPublicId = uploadResult.public_id;

        } catch (uploadError) {
            console.error("Cloudinary upload error during update:", uploadError);
            return next(new HttpError('Failed to upload image to Cloudinary', 500));
        }
    }



    try {
        updatedPromotion = await Promotion.findByIdAndUpdate(
            id,
            {
                title: title || updatedPromotion?.title,
                description: description || updatedPromotion?.description,
                discountType: discountType || updatedPromotion?.discountType,
                discountValue: discountValue || updatedPromotion?.discountValue,
                startAt: startAt || updatedPromotion?.startAt,
                endAt: endAt || updatedPromotion?.endAt,
                active: active || updatedPromotion?.active
            },
            { new: true }
        );
        if (!updatedPromotion) {
            return next(new HttpError('Promotion not found', 404));
        }
        res.status(200).json(new HttpSuccess('Promotion updated successfully', updatedPromotion));
    } catch (err) {
        if (updatedPublicId) {
            try {
                await cloudinary.uploader.destroy(updatedPublicId);
            } catch (deleteErr) {
                console.error("Failed to delete image from Cloudinary:", deleteErr);
            }
        }
        return next(new HttpError('Updating promotion failed, please try again later.', 500));
    }
};

const DeletePromotion = async (req, res, next) => {
    console.log("DELETE request received");
    const { id } = req.params;
    try {
        const deletedPromotion = await Promotion.findByIdAndDelete(id);
        if (!deletedPromotion) {
            return res.status(404).json({ message: "Promotion not found" });
        }
        res.status(200).json({ message: "Promotion deleted successfully" });
    } catch (err) {
        if (deletedPromotion.publicId) {
            try {
                await cloudinary.uploader.destroy(deletedPromotion.publicId);
            } catch (deleteErr) {
                console.error("Failed to delete image from Cloudinary:", deleteErr);
            }
        }
        return next(new HttpError('Deleting promotion failed, please try again later.', 500));
    }
};

module.exports = {
    GetAllPromotions,
    GetPromotionById,
    CreatePromotion,
    UpdatePromotion,
    DeletePromotion
};