const cloudinary = require('cloudinary').v2;


exports.deleteFromCloudinary = async (url) => {

    try {

        const regex = /\/upload\/(?:v\d+\/)?(.+?)(\.\w+)?$/;
        const match = url.match(regex);
        url = match ? match[1] : null;
        await cloudinary.uploader.destroy(url);

    } catch (error) {
        console.log("unable to delete the image from the cloudinary", error);
    }
}
