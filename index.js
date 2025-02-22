const express = require('express')
const app = express()
let morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

app.use(cors())
app.use(express.json())
app.use(express.static('dist'))

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

app.use(requestLogger)

app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms')
)

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.get('/info', (request, response) => {
  const timestamps = new Date()
  const totalEntries = Person.length
  response.send(`
    <p>Phonebook has info for ${totalEntries} people</p>
    <p>Request received at : ${timestamps}</p>
    `)
})

// get request
app.get('/api/persons', (request, response) => {
  Person.find({})
    .then((persons) => {
      response.json(persons)
    })
    .catch((error) => {
      console.error(error)
      response.status(500).json({ error: 'Error fetching persons' })
    })
})

// post request
app.post('/api/persons', (request, response, next) => {
  const { name, number } = request.body

  if (!name || !number) {
    return response.status(400).json({ error: 'Name and Number are required' })
  }

  // Check if the name already exists in the database
  Person.findOne({ name }).then((existingPerson) => {
    if (existingPerson) {
      return response.status(400).json({ error: 'Name must be unique' })
    }

    // Create a new instance of the Person model
    const newPerson = new Person({
      name,
      number,
    })

    // Save to MongoDB
    newPerson.save().then((savedPerson) => {
      response.json(savedPerson)
    }).catch((error) => next(error))
  })
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => {
      console.error(error)
      response.status(400).send({ error: 'Malformatted id' })
    })
})



// delete request
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch((error) => next(error))
})

// const generateId = () => {
//   const maxId = persons.length > 0 ? Math.floor(Math.random() * 1000000) : 0;
//   return maxId;
// };



// put request
app.put('/api/persons/:id', (request, response, next) => {
  const { content, important } = request.body

  Person.findByIdAndUpdate(
    request.params.id,
    { content, important },
    { new: true, runValidators: true, context: 'query' }
  )
    .then((updatedPerson) => {
      response.json(updatedPerson)
    })
    .catch((error) => next(error))
})

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = 3003
app.listen(PORT)
console.log(`Server running on port ${PORT}`)
