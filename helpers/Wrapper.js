module.exports = function AsyncWrapper(fn) {
    return function(request, response, next){
        fn(request, response, next).catch(err => next(err))
    }
    
}
