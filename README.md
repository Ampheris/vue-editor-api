# vue-editor-api
An  API backend in express to handle the vue frontend.

## How to set up the project
First, run the following to install all node modules:
```
npm run install
```
If you do not have npm, please install it.

### Run backend locally
stand in the root folder and run the following command:
```
npm run start
```
### Run backend for production
Stand in the root folder and run the following command:
```
npm run production
```
If the backend is deployed to Azure, make sure that the frontend baseUrl is changed to the one you use. 
The file is called http-commons.
## The url paths of the api
### Get all files
```
localhost:1337/api/all
```
Will return the following:
````json
{
  "files": [
    {
      "_id": "6315eb88385d0ed7724307b8",
      "title": "Test document",
      "content": "bla blab alb whhejwad awdn adjawpdj awpjdaöo"
    }
  ]
}
````

### Create new document
```
localhost:1337/api/create
```
Will return the following:
````json
{
  "_id": "6316ffefa5373a8c319738e9",
  "name": "Cheesecake",
  "content": "1pkt cheese + 1pkt cake"
}
````
You will get the created id for the document to be able to keep track of what file you're updating.

### Update file
```
localhost:1337/api/update/:id
```
Where :id, is the '_id' of the document you're currently working on. It will return the following:
````json
{
  "acknowledged": true,
  "modifiedCount": 0,
  "upsertedId": null,
  "upsertedCount": 0,
  "matchedCount": 1
}
````

### Get one specific file
This will be the function called when opening a document. So that it always will be loading the correct information about
the document.
```
localhost:1337/api/get/:id
```
Where :id, is the '_id' of the document you're currently working on. It will return the following:
````json
{
  "file":
    {
      "_id":"63160057960e6485d210f86e",
      "name":"Bakery oatcakes",
      "content":"Cookies n cakes"
    }
}
````