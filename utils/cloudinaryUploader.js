// in this util we will write the code to upload the image to the cloudinary

const cloudinary = require('cloudinary').v2

exports.uploadToCloudinary = async (file, folder, quality) => {
    const options = { folder }
    if (quality) {
        options.quality = quality
    }
    options.resource_type = 'auto'
    return await cloudinary.uploader.upload(file.tempFilePath, options)
}