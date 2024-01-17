// authentication and authoraization------------------------------------------------------------------------

//save the password's hash in the but not the real password(bcryptjs)

//for authorization and authentication --we will use jwt tokens:-

//  user will post email and password
//  server will generate a jwt token(passport)
//  client will save the token into browser
//  wheenver user wants data it also sends jwt token
//  server validates the token and send backs data is correct

// jwt token contains three parts
//1     -- header contains meta data about the token
//2     -- payload contains the data we want to sent
//3     -- verify signature(generated using header,payload,secret key stored on server)
//              --- header+payload+secret==signature --> signature,payload,header=jwt

//whenever the server recieves jwt ----
//          IT takes the payload and header and scret key from sever and creates signature and if the signature with data matches this signature
//          then the token is correct and user is allowed to access(payload is not manipulated)

//NOTE-----------------we created a signTOken function which uses jwt sign to sign tokens using the user.id,jwtsecret,jwt expiry
//NOTE-----------------we created a method correctPassword on user which uses jwt.compare to compare given pass and hashed pass
//NOTE-----------------we created a method changedPasswordAfter(decoded.iat) takes the token creation time and returns true if pasword is changed after token creation
//NOTE-----------------we create a method createPasswordResetToken on user which will create a resettoken using crypto and hash and save it to db and sets token expiry time and returns the unhased token
//NOTE-----------------we have a pre save function if the user pasword is modified and user is not new passwordchangedAT field is updated before saving
//NOTE-----------------we have a pre save function if the user pasword is modified then it is hashed and then saved in the db

//we started with the signup function
//  1 create a user using create
//2 sign the token and send res

//login function
//  1 check if email and password exist in boy
//  2 check if user exists and password is hidden so we do .select('+password')
//  3- check if password is correct using correctPassword
//  4- sign and send token

// protect middleware
//  1- get the token if it is there in headers.authorization and starts with Bearer
//  2- promisify jwt.verify and enter token and secret key to get decodedtoken
//  3- check if user exist by id
//  4-check if password changed after(decoded.iat)
//  5-grant access to the route and save req.user=user
// restrictTo(...roles) middleware
//  1-if login in user from req.user.role is not in roles array then return error else move ahead
//forgetPassword==post
//  1-get user based on entered email
//  2-create a user.PasswordResetToken()
//  3- save the user adn turn validation check of because post request so user.save({validateBeforeSave:false})
//   4-send the token to email and use this token on resetpassword

//RESET password---patch
//  /1- get the token and hashit
//  2- using hashed token get the user and if token has not expired
//  3-if user exists and token not expired then update password,resetTOken=undefined,expirydate-undefined save the user
//  4- sign token and send the token

//update password--patch
//  1-get the user from the collection(protected route)
//  2-cehck if posted current paswrod is correct using instance method correctpassword
//  3-if so update password adn save
//  4- sign token and send

//what are cookies?
//cookies are small pieces of text sent to the client(browser) by the server everytime the client makes a request to the server
//cookies are stored in the browser and sent back to the server along with the request
//we will send jwt token in the cookie and not in the body

//rate limiting-------------------------
