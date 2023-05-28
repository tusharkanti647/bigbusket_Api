const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const secretKey = process.env.KEY;

const usersSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true, //left and right side of the name if have any spce it trimes
    },
    number: {
        type: String,
        require: true,
        uniqued: true, // it creat the number is unique
        maxlength: 10, //it creat the length of the number only 10
    },
    email: {
        type: String,
        require: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    conPassword: {
        type: String,
        required: true,
        minlength: 6,
    },
    tokens: [
        {
            token: {
                type: String,
                required: true,
            }
        }
    ],
    cart: Array,
});


// //jwt token generet
// usersSchema.methods.generateAuthToken = async function () {
//     console.log(this);
//     try {
//         let token = jwt.sign({ _id: this._id }, secretKey);
//         this.tokens = this.tokens.concat({ token: token });
//         await this.save();
//     } catch (err) {
//         console.log(err);
//     }
// }
// generting token
// usersSchema.methods.generatAuthtoken = async function(){
//     try {
//         let token = jwt.sign({ _id: this._id},secretKey,{
//             expiresIn:"1d"
//         });
//         this.tokens = this.tokens.concat({token:token});
//         await this.save();
//         return token;

//     } catch (error) {
//         console.log(error);
//     }
// }


const userModel = mongoose.model("users", usersSchema);


//product cchema
//----------------------------------------------------------------

const productSchema = new mongoose.Schema({
    category: {
        type: String,
        require: true,
    },
    imgLink: {
        type: String,
        require: true,
    },
    titel: {
        type: String,
        require: true,
    },
    discountPrice: {
        type: Number,
        require: true,
    },
    originalPrice: {
        type: Number,
        require: true,
    },
    rating: {
        type: String,
    },
    about: {
        weight: [],
        pcs: {
            type: String,
        },
        describtion: {
            type: String,
        },
    }

});





const productModel = mongoose.model("products", productSchema);


module.exports = { userModel, productModel };