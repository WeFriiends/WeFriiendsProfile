import cloudinary from '../services/cloudinary';

function uploadAsset(req, res) {
    const imageUrl = "https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg";
  
    cloudinary.uploader.upload(imageUrl, { public_id: "olympic_flag" }, 
      function(error, result) {
        if (error) {
          console.error(error);
          res.status(500).json({ error: "Error uploading asset" });
        } else {
          console.log(result);
          res.status(200).json({ message: "Asset uploaded successfully", result });
        }
      }
    );
  }
  
  export { uploadAsset };