var {pwd} = require('./pwd.js');

const config={
    production :{
        SECRET: process.env.SECRET,
        DATABASE: process.env.MONGODB_URI
    },
    default : {
        SECRET: 'mysecretkey',
        // DATABASE: 'mongodb://localhost:27017/Users'
        DATABASE: `mongodb+srv://Zain:${pwd}@cluster0.4v029.mongodb.net/Document-Flow-Application?retryWrites=true&w=majority`
    
    }
}


exports.get = function get(env){
    return config[env] || config.default
}