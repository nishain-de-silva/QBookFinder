const router = require('express').Router()
const commonUtils = require('../common');
const BookStore = require('../models/BookStore');

router.get('/',async (req,res)=>{
    console.log('request recieved')
    const shopName = req.body.name;
    if(commonUtils.validate({'Shop Name':shopName}))
        return
    const shopList = await BookStore.find({$text:{$search:shopName}})
    return res.send({list:shopList})
})
router.get('/:id',async (req,res)=>{
    const foundBookStore =  await BookStore.findById(req.params.id)
    if(!foundBookStore)
        return res.send({notFound:true,message:'store not found'})
    return res.send(foundBookStore)    
})
router.post('/',async (req,res)=>{
    if(commonUtils.validateAgainstSchema(BookStore,req.body,res))
        return
    const newBook = await new BookStore(commonUtils.copyFromBody(req.body,{'books':{restrict:true}})).save()  
    return  res.send(newBook)
})
router.put('/:id/:action',async (req,res)=>{
    const action = req.params.action
    const id = req.params.id
    const foundBook = await BookStore.findById(id)
    if(!foundBook)
        return res.status(404).send({message:"bookStore not found"})
    if(commonUtils.validateAgainstSchema(BookStore,req.body,res,true))    
        return
    const updatingBody = commonUtils.copyFromBody(req.body,{'books':{restrict:true}})
    if(action == 'add' || action=='remove')
        updatingBody[action == 'add'? '$push' : '$pull'] = { 'books' : req.body['books'].length > 0 ? req.body['books'][0] : [] }
    const result = await BookStore.updateOne({_id:id},updatingBody)
    
    res.send({updatedCount:result.modifiedCount})
})
router.delete('/:id',async (req,res)=>{
    const id = req.params.id
    const foundBook = await BookStore.findById(id)
    if(!foundBook)
        return res.status(404).send({message:"bookstore not found"})
    const deleteCount = await BookStore.findByIdAndDelete(id)
    res.send({deleteCount:deleteCount})
})
module.exports = router

