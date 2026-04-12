const { validationResult } = require('express-validator');


const HttpError = require('../models/http_error');
const MenuItem = require('../models/menus');
const HttpSuccess = require('../models/http_success');
const { uploadBufferToCloudinary } = require('../middleware/file_upload');


const GetAllMenus = async (req, res, next) => {
    console.log("GET request received");
    try {
        const menuItems = await MenuItem.find();
        if (!menuItems) {
            return next(new HttpError('No menu items found', 404));
        }
        res.status(200).json(new HttpSuccess('Menu items fetched successfully', menuItems));
    } catch (err) {
        return next(new HttpError('Fetching menu items failed, please try again later.', 500));
    }
};

const GetMenuItemById = async (req, res, next) => {
    console.log("GET request received");
    const { id } = req.params;
    let menuItem;
    try {
        menuItem = await MenuItem.findById(id);
    }
    catch (err) {
        return next(new HttpError('Fetching menu item failed, please try again later.', 500));
    }
    res.status(200).json(new HttpSuccess('Menu item fetched successfully', menuItem));
}

const CreateMenuItem = async (req, res, next) => {
    console.log("POST request received");

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError(errors.array()[0].msg, 422, errors.array()));
    }
    const {
        category,
        name,
        description,
        priceCents,
        featured,
        available,
        sortOrder
    } = req.body;
    let menuItem;

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
    menuItem = new MenuItem({ category, name, description, priceCents, featured, imageUrl, available, sortOrder });

    try {
        await menuItem.save();
        res.status(201).json({ menuItem });
    } catch (err) {
        return next(new HttpError('Creating menu item failed, please try again later.', 500));
    }
}

const UpdateMenuItem = async (req, res, next) => {
    console.log("PATCH request received");
    const { id } = req.params;
    const { category, name, description, priceCents, imageUrl, available, sortOrder } = req.body;
    let updatedMenuItem;


    try {
            updatedMenuItem = await MenuItem.findById(id);
            if (!updatedMenuItem) {
                return next(new HttpError('Menu item not found', 404));
            }
        } catch (err) {
            console.log("Error fetching menu item for update:", err);
            return next(new HttpError('Fetching menu item failed, please try again later.', 500));
        }

    let updatedImageUrl = updatedMenuItem.imageUrl;
    let updatedPublicId = updatedMenuItem.publicId;

    if (req.file) {
        try {
            if (updatedMenuItem.publicId) {
                await cloudinary.uploader.destroy(updatedMenuItem.publicId);
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

        updatedMenuItem = await MenuItem.findByIdAndUpdate(id,
            {
                category: category || updatedMenuItem?.category,
                name: name || updatedMenuItem?.name,
                description: description || updatedMenuItem?.description,
                priceCents: priceCents || updatedMenuItem?.priceCents,
                imageUrl: updatedImageUrl || updatedMenuItem?.imageUrl,
                publicId: updatedPublicId || updatedMenuItem?.publicId,
                available: available || updatedMenuItem?.available,
                sortOrder: sortOrder || updatedMenuItem?.sortOrder
            },
            { new: true });
        if (!updatedMenuItem) {
            return next(new HttpError('Menu item not found', 404));
        }
        res.status(200).json(new HttpSuccess('Menu item updated successfully', updatedMenuItem));
    }
    catch (err) {
        return next(new HttpError('Updating menu item failed, please try again later.', 500));
    }
}

const DeleteMenuItem = async (req, res, next) => {
    console.log("DELETE request received");
    const { id } = req.params;
        let deletedMenuItem;
    try {
         deletedMenuItem = await MenuItem.findByIdAndDelete(id);
        if (!deletedMenuItem) {
            return next(new HttpError('Menu item not found', 404));
        }
        res.status(200).json(new HttpSuccess('Menu item deleted successfully', deletedMenuItem));
    } catch (err) {
        if (deletedMenuItem.publicId) {
           try {
               await cloudinary.uploader.destroy(deletedMenuItem.publicId);
           } catch (deleteErr) {
               console.error("Failed to delete image from Cloudinary:", deleteErr);
           }
       }
        return next(new HttpError('Deleting menu item failed, please try again later.', 500));
    }
}

module.exports = {
    GetAllMenus,
    GetMenuItemById,
    CreateMenuItem,
    UpdateMenuItem,
    DeleteMenuItem
}  