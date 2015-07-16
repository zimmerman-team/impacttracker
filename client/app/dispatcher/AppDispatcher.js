var Dispatcher = require('flux').Dispatcher;
var objectAssign = require('object-assign')

// var AppDispatcher = objectAssign({}, new Dispatcher(), {
//     handleViewAction: function(action) {
//         this.dispatch({
//             source: "VIEW_ACTION",
//             action: action
//         })
//     }
// })

// module.exports = AppDispatcher;

module.exports = new Dispatcher();