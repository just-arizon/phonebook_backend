const express = require('express')
const app = express()
let morgan = require('morgan')
const cors = require('cors')

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
    response.json(persons)
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
const body = request.body

if (!body.name || !body.number) {
  return response.status(400).json({
    error: 'name or number missing'
  })
}
if (body.name) {
  return response.status(400).json({
    error: 'name must be unique'
  })
}

const person = {
  name: body.name,
  number: body.number,
  id: generateId()
}
persons = persons.concat(person)
response.json(person)
})


const PORT = 3003; ;
app.listen(PORT)
console.log(`Server running on port ${PORT}`);
