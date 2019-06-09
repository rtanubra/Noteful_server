const FoldersService = {
    getAllFolders(knex){
        return knex.select('*').from('noteful_folders')
    },
    getById(knex,id){
        return knex.select('*')
            .from('noteful_folders')
            .where({id}).first()
    },
    postFolder(knex,newFolder){
        return knex.into('noteful_folders')
            .insert(newFolder)
            .returning('*')
            .then(rows=>{
                return rows[0]
            })
    },
    updateFolder(knex,id,newFolder){
        return knex('noteful_folders')
            .where({id})
            .update(newFolder)
            .returning('*')
            .then(rows=>{
                return rows[0]
            })
    },
    deleteFolder(knex,id){
        return knex('noteful_folders')
            .where({id})
            .delete()
    }
}

module.exports = FoldersService