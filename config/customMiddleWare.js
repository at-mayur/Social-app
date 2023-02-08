
// MiddleWare to transfer flash messages from request to response
// Rather than doing it for evry render operation
module.exports.flashSet = function(request, response, next){
    // console.log(request.flash('success'));
    response.locals.messages = {
        'success': request.flash('success'),
        'error': request.flash('error'),
        'info': request.flash('info')
    };

    next();
};