# Item Images Directory

Place your item images in this directory.

## How to Add a Test Image:

1. **Copy any image file** (jpg, png, etc.) to this folder
   - Example: `test_item.jpg` or `sample_image.png`

2. **When creating a new item** in the Restock > New Stock form:
   - Fill in all the item details
   - In the "Image URL" field, enter: `/uploads/item_images/your_filename.jpg`
   - Replace `your_filename.jpg` with your actual image filename

3. **Example:**
   - Image file: `backend/uploads/item_images/test_item.jpg`
   - Image URL in form: `/uploads/item_images/test_item.jpg`

## Supported Formats:
- JPG/JPEG
- PNG
- GIF
- WebP

## Notes:
- Image URLs can be relative paths (starting with `/uploads/`) or full URLs (starting with `http://`)
- Make sure the image file exists in this directory before submitting the form
- Image will be displayed in the UI when selecting items in Request/Restock/Return pages

