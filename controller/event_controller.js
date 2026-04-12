const { validationResult } = require('express-validator');
const cloudinary = require('cloudinary').v2;

const HttpError = require('../models/http_error');
const HttpSuccess = require('../models/http_success');
const Event = require('../models/event');
const { uploadBufferToCloudinary } = require('../middleware/file_upload');


const GetAllEvents = async (req, res, next) => {
    console.log("GET request received");
    try {
        const events = await Event.find();
        if(!events) {
            return next(new HttpError('No events found', 404));
        }
        res.status(200).json(new HttpSuccess('Events fetched successfully', events));
    }
    catch (err) {
        return next(new HttpError('Fetching events failed, please try again later.', 500));
    }
}

const GetEventById = async (req, res, next) => {
    console.log("GET request received");
    const { id } = req.params;
    let event;
    try {
        event = await Event.findById(id);
        if(!event) {
            return next(new HttpError('Event not found', 404));
        }
    }
    catch (err) {
        return next(new HttpError('Fetching event failed, please try again later.', 500));
    }
    res.status(200).json(new HttpSuccess('Event fetched successfully', event));
}

const CreateEvent = async (req, res, next) => {
    console.log("POST request received");

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError(errors.array()[0].msg, 422, errors.array()));
    }

    const { title, startsAt, endsAt, location, description, published, sortOrder } = req.body;

    // Check if image was uploaded
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

    // Create new event with Cloudinary image URL
    const newEvent = new Event({
        title,
        startsAt,
        endsAt,
        location,
        description,
        imageUrl,          // Now comes from Cloudinary
        publicId,          // ← Recommended to save for later deletion
        published: true,
        sortOrder: sortOrder || 0,
    });

    try {
        await newEvent.save();
        res.status(201).json(new HttpSuccess('Event created successfully', newEvent));
    } catch (err) {
        console.error("Error creating event:", err);

        // Optional: Delete image from Cloudinary if database save fails
        if (publicId) {
            try {
                await cloudinary.uploader.destroy(publicId);
            } catch (deleteErr) {
                console.error("Failed to delete image from Cloudinary:", deleteErr);
            }
        }

        return next(new HttpError('Creating event failed, please try again later.', 500));
    }
};

const UpdateEvent = async (req, res, next) => {
    console.log("PATCH request received");
    const { id } = req.params;
    const { title, startsAt, endsAt, location, description, imageUrl, published, sortOrder } = req.body;

    let existingEvent;
    try {
        existingEvent = await Event.findById(id);
        if (!existingEvent) {
            return next(new HttpError('Event not found', 404));
        }
    } catch (err) {
        console.log("Error fetching event for update:", err);
        return next(new HttpError('Fetching event failed, please try again later.', 500));
    }

    let updatedImageUrl = existingEvent.imageUrl;
    let updatedPublicId = existingEvent.publicId;

    if (req.file) {
        try {
            if (existingEvent.publicId) {
                await cloudinary.uploader.destroy(existingEvent.publicId);
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
        const updatedEvent = await Event.findByIdAndUpdate(
            id,
            {
                title: title || existingEvent.title,
                startsAt: startsAt || existingEvent.startsAt,
                endsAt: endsAt || existingEvent.endsAt,
                location: location || existingEvent.location,
                description: description || existingEvent.description,
                imageUrl: imageUrl || updatedImageUrl,
                publicId: updatedPublicId,
                published: typeof published !== 'undefined' ? published : existingEvent.published,
                sortOrder: typeof sortOrder !== 'undefined' ? sortOrder : existingEvent.sortOrder,
            },
            {
                new: true,
                runValidators: true,
            }
        );

        res.status(200).json(new HttpSuccess('Event updated successfully', updatedEvent));
    } catch (err) {
        console.log("Error updating event: ", err);
        return next(new HttpError('Updating event failed, please try again later.', 500));
    }
}

const DeleteEvent = async (req, res, next) => {
    console.log("DELETE request received");
    const { id } = req.params;
    let deletedEvent;
    try {
        deletedEvent = await Event.findByIdAndDelete(id);
        if(!deletedEvent) {
            return next(new HttpError('Event not found', 404));
        }
    }
    catch (err) {
         if (deletedEvent.publicId) {
            try {
                await cloudinary.uploader.destroy(deletedEvent.publicId);
            } catch (deleteErr) {
                console.error("Failed to delete image from Cloudinary:", deleteErr);
            }
        }
        return next(new HttpError('Deleting event failed, please try again later.', 500));
    }
    res.status(200).json({
        message: 'Event deleted successfully',
    });
}

module.exports = {
    GetAllEvents,
    GetEventById,
    CreateEvent,
    UpdateEvent,
    DeleteEvent
}