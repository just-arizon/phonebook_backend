const mongoose = require('mongoose');

// Ensure at least 3 arguments (password, name, number)
if (process.argv.length < 5) {
  console.log('Usage: node mongo.js <password> <name> <number>');
  process.exit(1);
}

const password = process.argv[2];
const name = process.argv[3];
const number = process.argv[4];


if (process.argv.length<3) {
    console.log('give password as argument')
    process.exit(1)
  }
  


const url = process.env.MONGODB_URI

mongoose.set('strictQuery', false);

// Connect to MongoDB
mongoose.connect(url)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("Connection error:", err));

// Define Schema & Model
const personSchema = new mongoose.Schema({
  name: String,
  number: String, // Changed from Number to String to handle dashes
});

const Person = mongoose.model('Person', personSchema);

// Add New Contact
const person = new Person({
  name,
  number,
});

// person.save().then(() => {
//   console.log(`added ${name} number ${number} to phonebook`);
//   mongoose.connection.close();
// });

Person
.find({})
.then(result => {
    result.forEach(persons => {
      console.log(persons)
    })
    mongoose.connection.close()
  })