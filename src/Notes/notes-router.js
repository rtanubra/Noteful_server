const notesService = require('./notes-service.js')
const foldersService = require('../Folders/folders-service')
const express = require('express')
const xss = require('xss')

const notesRouter = express.Router()
const jsonParser = express.json()

function sanitizeNote(note){
    note.content = xss(note.content)
    note.name = xss(note.name)
    return note
}
function identifyFolders(folders){
    const folderIds = []
    folders.forEach(folder=>{
        folderIds.push(folder.id)
    })
    return folderIds
}

notesRouter
    .route('/')
    .get((req,res,next)=>{
        const knexInstance = req.app.get('db')
        notesService.getAllNotes(knexInstance)
            .then(notes=>{
                const sanitizedNotes = notes.map(note=>{
                    return sanitizeNote(note)
                })
                return res.json(sanitizedNotes)
            }).catch(next)
    })
    .post(jsonParser,(req,res,next)=>{
        const { name,content,folderid } = req.body
        const note = {name,content,folderid}
        
        const requiredFields = ['name','content','folderid']
        requiredFields.forEach(field=>{
            if(note[field] == null){
                return res.status(400).json({error:{message:`${field} is required to create a note`}})
            }
        })

        
        const knexInstance = req.app.get('db')

        foldersService.getAllFolders(knexInstance)
            .then(fldrs=>{
                const folders = identifyFolders(fldrs)
                if (folders.indexOf(note.folderid) == -1){
                    return res.status(404).json({error:{message:`Folder with id ${note.folderid} cannot be located in folders`}})
                }
                const sanitizedNote = sanitizeNote(note)
                notesService.postNote(knexInstance,sanitizedNote)
                .then(note=>{
                const sanitizedNote = sanitizeNote(note)
                return res.json(sanitizeNote(sanitizedNote))
            }).catch(next)
        }).catch(next)      
    })

notesRouter
    .route('/:id')
    .all((req,res,next)=>{
        const knexInstance = req.app.get('db')
        const {id} = req.params
        notesService.getById(knexInstance,id)
            .then(note=>{
                if (!note){
                    return res.status(404).json({error:{message:`Could not find note with provided id`}})
                }
            res.note=sanitizeNote(note)
            next()
        }).catch(next)
    })
    .get((req,res,next)=>{
        return res.json(res.note)
    })
    .delete((req,res,next)=>{
        const knexInstance = req.app.get('db')
        const {id} = req.params
        notesService.deleteFolder(knexInstance,id)
            .then(()=>{
                return res.status(200).json({success:{message:`Successfully deleted note with id ${id}`}})
            })
    })
    .patch(jsonParser,(req,res,next)=>{
        const {id} = req.params
        const {name,content} = req.body
        if (!name && !content){
            return res.status(400).json({error:{message:`Either name and content are required to update a note`}})
        }
        const newNote = {}
        if (name){
            newNote.name = xss(name)
        }
        if (content){
            newNote.content = xss(content)
        }
        const knexInstance = req.app.get('db')
        notesService.updateFolder(knexInstance,id,newNote)
            .then(note=>{
                const sanitizedNote = sanitizeNote(note)
                return res.status(200).json(sanitizedNote)
            }).catch(next)
    })



module.exports = notesRouter