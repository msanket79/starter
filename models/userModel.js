const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us the name'],
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Please provide your email'],

    lowercase: true,
    validate: [validator.isEmail, 'invalid email id is entered'],
  },
  photo: {
    type: String,
    default: 'bata dunga bad me',
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    minlength: [8, 'password must be 8 characters'],
    required: [true, 'Please require a password'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: 'password and conf password must be same',
    },
  },
  passwordChangedAfter: {
    type: Date,
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetExpires: {
    type: Date,
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  //the token maybe be created earlier than saving the data in database then token is expired because passchanged>after token issued
  this.passwordChangedAfter = Date.now() - 1000;
  next();
});
userSchema.pre('save', async function (next) {
  //only runs when pass is modified
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined; //to delete from the database
  next();
});
//this is called instance method and is avaliable on all the instances of user
// (candiadate password comes from user and userPassword(hash) is saved in db)

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  // console.log(candidatePassword, userPassword);
  return await bcrypt.compare(candidatePassword, userPassword);
};

//returns false if password is not changes after token was created
userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  //user has changed the password before
  if (this.passwordChangedAfter) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAfter.getTime() / 1000,
      10,
    );
    return JWTTimeStamp < changedTimeStamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
