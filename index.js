require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person')

const app = express()

app.use(express.json())
app.use(express.static('dist'))

app.use(morgan(':method :url :status - :response-time ms :date[web]'))

const dateNow = () => {
  return new Date().toString()
}

const checkName = (name) => {
  return persons.find(person => person.name === name)
}

let persons = []

app.get('/info', (request, response) => {
  const count = persons.length
  const htmlResponse = `
    <p>Phonebook has info for ${count} people</p>
    ${dateNow()}
    `
  response.send(htmlResponse)
})

app.get('/api/persons', (request, response) => {
  Person.find({})
    .then(persons => {
      response.json(persons)
    })
})

app.get('/api/persons/:id', (request, response) => {
  Note.findById(request.params.id)
    .then(person => {
      response.json(person)
    })
})

app.post('/api/persons', morgan(':method :url :status :body - :response-time ms :date[web]'), (request, response) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({"error": "name or number is missing" })
  }

  if (checkName(body.name)) {
    return response.status(400).json({"error": "name must be unique"})
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person
    .save()
    .then(savedPerson => {
      response.json(savedPerson)
    })

  morgan.token('body', request => JSON.stringify(request.body))
})

app.put('/api/persons/:id', morgan(':method :url :status :body - :response-time ms :date[web]'), (request, response) => {
  const id = request.params.id
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({"error": "name or number is missing" })
  }

  const resPerson = persons.find(person => person.id === id)

  if (resPerson) {
    const person = {
      ...resPerson,
      "number": body.number,
    }
    const index = persons.indexOf(resPerson)
    persons[index] = person
    morgan.token('body', request => JSON.stringify(request.body))
    return response.json(person)
  }
  return response.status(404).json({"error": "not found"})
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id

  persons = persons.filter(person => person.id != id)

  response.status(204).end()
})


const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
