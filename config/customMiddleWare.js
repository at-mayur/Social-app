
module.exports.flashSet = function(request, response, next){
    // console.log(request.flash('success'));
    response.locals.messages = {
        'success': request.flash('success'),
        'error': request.flash('error')
    };

    next();
};