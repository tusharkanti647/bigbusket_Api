


const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const passport = require("passport");


router.use(bodyParser.json());

const { userModel, productModel } = require("../model/schema");

const secretKey = process.env.KEY;
require("./passport");
//const = require(".")

// router.get("/", (req, res) => {
//     res.send("welcome my root page from roter");
// });
//--------------------------------------------------------------------------------------------------------








//signUp root
//--------------------------------------------------------------------------------------
router.post("/signup", async (req, res) => {
    const { name, number, email, password, conPassword } = req.body;

    if (!name || !number || !email || !password || !conPassword) {
        res.status(400).jeson("plices provide data");
        return;
    }
    const user = new userModel({
        name: req.body.name,
        number: req.body.number,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10),
        conPassword: bcrypt.hashSync(req.body.conPassword, 10),
    });

    try {
        const respons = await user.save();
        //console.log(respons);
        // res.status(201).json({
        //     status: true,
        //     user: user,
        // });

        const token = await generateAuthToken(respons._id);
        //console.log(token);
        res.status(201).json({ user, token: "Bearer " + token });
    } catch (err) {
        res.status(400).json(err);
    }
    // user.save().then(() => {
    //     res.send({
    //         status: true,
    //         user: user,
    //     })
    // }).catch((err) => {
    //     res.send({
    //         status: false,
    //         err
    //     });
    // });
});

//sign in path
//------------------------------------------------------------------------------------------
router.post("/signin", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json("invalid Credentials");
            return;
        }

        let user = await userModel.findOne({ email: email });
        if (!user) {
            res.status(400).send("not present");
            return;
        }

        if (!bcrypt.compareSync(req.body.password, user.password)) {
            res.status(400).send("password not match");
            return;
        }

        //generate token call the function
        const token = await generateAuthToken(user._id);
        //console.log(token);

        //generate cookie
        // res.cookie("eccomerce", token, {
        //     expires: new Date(Date.now() + 2589000),
        //     httpOnly: true
        // });
        res.status(201).json({ user, token: "Bearer " + token });
    } catch (error) {
        res.status(400).json({ error: "invalid crediential pass" });
        console.log("error the bhai catch ma for login time" + error.message);
    }
});

//product update path
//-------------------------------------------------------------------------------
router.post("/addproduct", (req, res) => {
    const { category, imgLink, titel, price, rating, about } = req.body;
    //console.log(req.body);
    const product = new productModel({
        category: category,
        imgLink: imgLink,
        titel: titel,
        price: price,
        rating: rating,
        about: {
            weight: about.weight,
            pcs: about.pcs,
            describtion: about.describtion,
        }
    })

    product.save().then(() => {
        res.send({ status: true, product });
    }).catch((err) => {
        res.send({ status: false, err });
    });
});

//product get path
//-----------------------------------------------------------------------------
router.get("/addproduct", async (req, res) => {
    const data = await productModel.find();
    //generate cookie
    //res.cookie("jwt", "tushar");
    res.send(data);
});

//product search get path
//-----------------------------------------------------------------------------
router.get("/products-search", async (req, res) => {
    try {
        let { searchName, page, sortQue, filters } = req.query;
        searchName = searchName || "";
        page = page - 1 || 0;
        sortQue = sortQue ? sortQue.split(" ") : ["rating", "-1"];
        filters = filters ? filters.split(" ") : ["fish", "borges", "fresho", "Dhara"];
        let limit = 8;

        let sortBy = {};
        sortBy[sortQue[0]] = parseInt(sortQue[1]);


        const data = await productModel.find({ titel: { $regex: searchName, $options: "i" } })
            .where("category")
            .in(filters)
            .sort(sortBy)
            .skip(page * limit)
            .limit(limit);

        const data2 = await productModel.find({ titel: { $regex: searchName, $options: "i" } })
            .where("category")
            .in(filters)
            .sort(sortBy)
            .skip((page + 1) * limit)
            .limit(limit);
        let isNextPagePresent = false;
        if (data2.length>0) {
            isNextPagePresent = true;
        }
        
        res.status(200).json({ data: data, isNextPagePresent: isNextPagePresent });
    } catch (e) {
        console.log(e);
        res.status(404).json(e);
    }
});


//product one get path
//----------------------------------------------------------------------------
router.get("/addproduct/:id", async (req, res) => {
    try {
        const data = await productModel.findById(req.params.id);
        res.send(data);
    } catch (err) {
        res.status(404).send(err);
    }
});

//basket bage count
//---------------------------------------------------------------------------------------
router.get("/basket_badge/count", passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        if (req.user) {
            let badgeContent = req.user.cart.length;
            res.status(200).json({ badgeContent });
        } else {
            res.status(404).send("please login first");
        }
    } catch (error) {
        console.log(error);
        res.status(404).send(error);
    }
})

//basket update product
//------------------------------------------------------------------------------------------------
router.put("/basket/:id", passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        if (req.user) {
            const _id = req.params.id;
            const userId = req.user.id;

            const data = await productModel.findOne({ _id: _id });
            const pushingData = { ...data._doc, qty: req.body.qty };
            //console.log(pushingData);
            const userdata = await userModel.findOneAndUpdate({ _id: userId }, {
                $push: {
                    //req.user.cart :"hello",
                    //qty:req.body.qty,
                    cart: pushingData,
                }
            }, {
                new: true
            });
            //console.log(userdata.cart);
            //req.user.cart.push({ ...data, qty: req.body.qty });
            res.send(userdata.cart);
        } else {
            res.status(404).send("please login first");
        }
    } catch (err) {
        res.status(404).send(err);
    }
},);

//basket get path
//-----------------------------------------------------------------------------------------------
router.get("/basket", passport.authenticate('jwt', { session: false }), (req, res) => {
    //console.log(req.user.cart.length);
    res.send(req.user.cart);
});

// update the quantity in basket
//-----------------------------------------------------------------------------------------------
router.put("/basket-product/quantity-update", passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        if (req.user) {
            const _id = req.user.id;
            const pTitel = req.body.titel;
            //console.log(req.body);
            // db.users.updateOne({"name":"tu", "cart.category":"borges"},{ $set:{"cart.$.qty": 10}})    _id: _id, "cart._id":pid
            //db.users.updateOne({_id:ObjectId("6415fc8727cea6f23af49856"), "cart._id":ObjectId("6415a754d53c68067d1f56e7")},{ $set:{"cart.$.qty": 15}})

            const respons = await userModel.updateOne({ _id: _id, "cart.titel": pTitel }, {
                $set: { "cart.$.qty": req.body.qty }
            });
            res.send(respons);
        }
    } catch (err) {
        console.log(err);
        res.send({ er: err })
    }
});

// to do empty the basket path
//-----------------------------------------------------------------------------------------------
router.put("/empty-basket", passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        if (req.user) {
            const _id = req.user.id;
            const respons = await userModel.updateOne({ _id: _id }, {
                $set: { cart: [] }
            });
            res.send(respons)
        }
    } catch (err) {
        console.log(err);
        res.send({ er: err })
    }
});


//remove 1 product from basket
//----------------------------------------------------------------------------------
router.put("/remove-product", passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        if (req.user) {
            const _id = req.user.id;
            const pTitel = req.body.titel;
            console.log(pTitel);
            const respons = await userModel.findOneAndUpdate({ _id: _id }, {
                $pull: { cart: { titel: pTitel } }
            }, {
                new: true
            });

            res.send(respons.cart)
        }
    } catch (err) {
        console.log(err);
        res.json({ err });
    }
});

//
//----------------------------------------------------------------------------------


//generet token 
async function generateAuthToken(id) {
    try {
        //first creat a paylod
        const paylod = {
            _id: id,
        }

        //creat token
        token = jwt.sign(paylod, secretKey, { expiresIn: "1d" });
        return token;
    } catch (err) {
        console.log(err);
    }
}


// router.get("/signup", (req, res) => {
//     //console.log(req.body);
//     res.send("req.body");
// });

module.exports = router;