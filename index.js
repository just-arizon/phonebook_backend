const express = require('express')
const app = express()
let morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

app.use(cors())
app.use(express.json())
app.use(express.static('dist'))

let persons = [
    { 
      id: "1",
      name: "Arto Hellas", 
      number: "040-123456"
    },
    { 
      id: "2",
      name: "Ada Lovelace", 
      number: "39-44-5323523"
    },
    { 
      id: "3",
      name: "Dan Abramov", 
      number: "12-43-234345"
    },
    { 
      id: "4",
      name: "Mary Poppendieck", 
      number: "39-23-6423122"
    }
]


app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))


app.get('/info', (request, response) => {
  const timestamps = new Date()
  const totalEntries = persons.length
  response.send(`
    <p>Phonebook has info for ${totalEntries} people</p>
    <p>Request received at : ${timestamps}</p>
    `)
})

// get request
app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons);
  }).catch(error => {
    console.error(error);
    response.status(500).json({ error: 'Error fetching persons' });
  });
})

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const person = persons.find(person => person.id === id)

  if (person) {
    response.json(person)
  } else{
    response.status(404).end()
  }
})
// delete request
app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})



const generateId = () => {
  const maxId = persons.length > 0
    ? Math.floor(Math.random() * 1000000)
    : 0
  return maxId
}

// post request
app.post('/api/persons', (request, response) => {
  const { name, number } = request.body;

  if (!name || !number) {
    return response.status(400).json({ error: 'Name and Number are required' });
  }

  // Check if the name already exists in the database
  Person.findOne({ name }).then((existingPerson) => {
    if (existingPerson) {
      return response.status(400).json({ error: 'Name must be unique' });
    }

    // Create a new instance of the Person model
    const newPerson = new Person({
      name,
      number,
    });

    // Save to MongoDB
    newPerson.save().then((savedPerson) => {
      response.json(savedPerson);
    });
  });
});


// persons = persons.concat(person)
// response.json(person)

// person.save().then(savedPerson => {
//   response.json(savedPerson);
// }).catch(error => {
//   console.error(error);
//   response.status(500).json({ error: 'Error saving person' });
// });




const PORT = 3003; ;
app.listen(PORT)
console.log(`Server running on port ${PORT}`);
