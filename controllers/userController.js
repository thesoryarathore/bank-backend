const users = require("../Model/userSchema");
const jwt = require("jsonwebtoken");

//register logic
exports.register = async (req, res) => {
  console.log("Inside register  function");

  //get data from req body
  const { username, acno, password } = req.body;

  try {
    //check acno in users model
    const result = await users.findOne({ acno });
    if (result) {
      //if acno exists, send response as "already exist"
      res.status(406).json("Account already exist. Please Log in!!!");
    } else {
      //if acno not exist, add to users model,
      const newUser = new users({
        username,
        acno,
        password,
        balance: 5000,
        transactions: [],
      });
      //to save changes to mongodb
      await newUser.save();
      //send response as "success"
      res.status(200).json(newUser);
    }
  } catch (err) {
    res.status(401).json(err);
  }
};

//login logic
exports.login = async (req, res) => {
  console.log("Inside login function");
  //get data from req body
  const { acno, password } = req.body;
  try {
    //check acno in monogodb
    const bankUser = await users.findOne({ acno, password });
    if (bankUser) {
      //user already exist - login success
      const token = jwt.sign({ loginAcno: acno }, "supersecretkey12345");
      res.status(200).json({
        loginUser: bankUser,
        token,
      });
    } else {
      res.status(404).json("* Invalid Account / Password *");
    }
  } catch (err) {
    res.status(401).json(err);
  }
};

//get balance logic
exports.getbalance = async (req, res) => {
  //get acno from req
  const { acno } = req.params;
  try {
    //check acno in  monogodb
    const response = await users.findOne({ acno });
    if (response) {
      //acno exist
      res.status(200).json(response.balance);
    } else {
      //acno not exist
      res.status(404).json("Account not found");
    }
  } catch (err) {
    res.status(401).json(err);
  }
};

//fund-transfer
exports.fundtransfer = async (req, res) => {
  console.log("Inside fund transfer");
  //debit acno
  const { loginData } = req;
  //get data from request : creditAcno, amount
  const { creditAcno, amount } = req.body;
  let amt = Number(amount);
  try {
    //check debit acno in mongodb
    const debitUser = await users.findOne({ acno: loginData });
    console.log(debitUser);

    //check credit user detail
    const creditUser = await users.findOne({ acno: creditAcno });
    console.log(creditUser);

    if(loginData==creditAcno){
        res.status(406).json("Operation denied!!!")
    }
    else{
        if (creditUser) {
            //sufficient blanace for debituser
            if (debitUser.balance >= amt) {
      
              debitUser.balance-=amt
              debitUser.transactions.push({
                  transaction_type:"DEBIT",amount:amt,toAcno:creditAcno,fromAcno:loginData
              })
              await debitUser.save()
              creditUser.balance+=amt
              creditUser.transactions.push({
                  transaction_type:"CREDIT",amount:amt,toAcno:creditAcno,fromAcno:loginData
              })
              await creditUser.save()
              res.status(200).json("Transaction completed Successfully. You can perform next transaction after some time!!!");
      
            } else {
              res.status(406).json("Transaction failed... Insufficient Balance!!!");
            }
          } else {
            res.status(404).json("Transaction failed... Invalid credit account details!!!");
          }
    }
  } catch (err) {
    res.status(401).json(err);
  }
};

exports.gettransactions = async (req,res)=>{
  console.log("Inside transaction function");
  //get acno to fetch transaction
  const { loginData } = req;
  //get all details of this acno from mongodb
  try{
    const userDetails = await users.findOne({acno:loginData})
    if(userDetails){
      const {transactions} = userDetails
      res.status(200).json(transactions)
    }
    else{
      res.status(404).json("Invalid Account Details!!!")
    }

  }catch (err) {
    res.status(401).json(err);
  }

}

exports.deleteAcno = async (req,res)=>{
  //get login data from token
  const { loginData } = req;
  try{
    await users.deleteOne({acno:loginData})
    res.status(200).json("Account removed Successfully!!!")
  }catch(err){
    res.status(401).json(err);
  }
}