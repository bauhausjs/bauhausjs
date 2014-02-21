# Bauhaus Asset

The asset plugin provides to manage and serve assets, as well as manipulating and scaling images.

*This is a proposal and not implemented yet*

## API

```
GET    /backend/api/Assets         Asset list
POST   /backend/api/Assets         Create new asset
GET    /backend/api/Assets/:id     Get single asset 
PUT    /backend/api/Assets/:id     Update asset data
DELETE /backend/api/Assets/:id     Delete asset (also deletes tranformed versions)

POST   /backend/api/:id/upload     Upload data for asset

// Frontend routes, also used for backend
GET    /assets/:id?transforms      Requesting with params creates new document, which 
GET    /assets/:name?transforms    Request based on file name 

Transform Params: 
 - width: Integer, e.g. 150        Width of returned image
 - height: Integer, e.g. 100       Height of returned image
 - scale_mode: 'fit'||'fill'       Scaling mode for thumbnails (fit makes sure original isn't cropped, fill crops                             thumb if it doesn't match size)
 - cropCoords: Array.<Arrays>.<Integer>, e.g. [ [10,10], [110,110] ] Coordinate based cropping with left-upper and right-bottom corrdinates
 - filter: Array.<Strings>         Array of custom filters to apply (e.g. rounded corners, sepia effect)
```

When an asset is requested at the frontend API with params a new document is generated which references to the original document via its `parentId` and adds the transform params to the `transforms` Object. If the asset is requested with the same transforms again, this is detected by MongoDB query and the cached version of the transformed asset is returned.

## Model 
```javascript
var asset = new Schema({
    name: String,
    data: Buffer,
    metadata: Object,

    transforms: Object,     // Cleaned request data for transformed assets
    parentId: ObjectId      // Id of original asset 
});
```

Standardized meta data fields are
 - `mimeType` `String`, e.g. `image/png`, is set on upload, is returned in HTTP Header as `Content-Type` when asset is request at frontend
 - `size` `Number`, size of asset data in bytes
 - `width` `Number`, width of images
 - `height` `Number`, height of images

