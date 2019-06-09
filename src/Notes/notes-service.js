const NotesService = {
    getAllNotes(knex){
        return knex.select('*').from('noteful_notes')
    },
    getById(knex,id){
        return knex.select('*').from('noteful_notes').where({id})
            .then(rows=>{
                return rows[0]
            })
    },
    postNote(knex,note){
        return knex.into('noteful_notes').insert(note)
            .returning('*')
            .then(rows=>{
                return rows[0]
            })
    },
    deleteFolder(knex,id){
        return knex('noteful_notes').where({id}).delete()
    },
    updateFolder(knex,id,newNote){
        return knex('noteful_notes').where({id}).update(newNote)
            .returning('*')
            .then((rows)=>{
                return rows[0]
            })
    }
}

module.exports= NotesService