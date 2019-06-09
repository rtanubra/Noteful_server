const express = require('express')
const FoldersService = require('./folders-service.js')
const xss = require('xss')

const foldersRouter = express.Router()
const jsonParser = express.json()

function sanitizeFolder(folder){
    return {'name':xss(folder.name),'id':folder.id}
}
foldersRouter
    .route('/')
    .get((req,res,next)=>{
        const knexInstance = req.app.get('db')
        FoldersService.getAllFolders(knexInstance)
            .then(folders =>{
                const sanitizedFolders = folders.map(folder=>{
                    return sanitizeFolder(folder)
                })
                return res.json(sanitizedFolders)
            }).catch(next)
    })
    .post(jsonParser,(req,res,next)=>{
        const knexInstance = req.app.get('db')
        const {name} = req.body
        if(!name){
            return res.status(400).json({error:{message:`name is a required for creating a folder`}})
        }
        const newFolder = {name:xss(name)}
        FoldersService.postFolder(knexInstance,newFolder)
            .then(folder=>{
                const sanitizedFolder = sanitizeFolder(folder)
                return res.json(sanitizedFolder)
            })
    })

foldersRouter
    .route('/:id')
    .all((req,res,next)=>{
        const knexInstance =req.app.get('db')
        const {id} = req.params
        FoldersService.getById(knexInstance,id)
            .then(folder=>{
                if(!folder){
                    return res.status(404).json({error:{message:`Could not find requested folder`}})
                }
                res.folder=folder
                next()
            }).catch(next)
    })
    .get((req,res,next)=>{
        const sanitizedFolder = sanitizeFolder(res.folder)
        return res.json(sanitizedFolder)
    })
    .patch(jsonParser,(req,res,next)=>{
        const knexInstance = req.app.get('db')
        const {id} = req.params
        const {name} = req.body
        const updatedFolder = {name:xss(name)}

        FoldersService.updateFolder(knexInstance,id,updatedFolder)
            .then(folder => {
                const sanitizedFolder = sanitizeFolder(folder)
                return res.json(sanitizedFolder)
            }).catch(next)
    })
    .delete((req,res,next)=>{
        const knexInstance = req.app.get('db')
        const {id} = req.params
        FoldersService.deleteFolder(knexInstance,id)
            .then(()=>{
                return res.status(200).json({message:`deleted folder with id:${id}`})
            })
    })

module.exports = foldersRouter
