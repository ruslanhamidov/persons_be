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

app.get('/info', (request, response) => {
  let count = 0
  Person.find({})
    .then(persons => {
      count = persons.length
      const htmlResponse = `
        <p>Phonebook has info for ${count} people</p>
        ${dateNow()}
        `
      response.send(htmlResponse)
    })
})

app.get('/api/persons', (request, response) => {
  Person.find({})
    .then(persons => {
      response.json(persons)
    })
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id)
    .then(person => {
      response.json(person)
    })
})

app.post('/api/persons', morgan(':method :url :status :body - :response-time ms :date[web]'), (request, response, next) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({ 'error': 'name or number is missing' })
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
    .catch(error => next(error))

  morgan.token('body', request => JSON.stringify(request.body))
})

app.put('/api/persons/:id', morgan(':method :url :status :body - :response-time ms :date[web]'), (request, response, next) => {
  const { number } = request.body

  Person.findById(request.params.id)
    .then(person => {
      if (!person) {
        return response.status(404).end()
      }

      person.number = number

      return person
        .save()
        .then((updatedPerson) => {
          response.json(updatedPerson)
        })
    })
    .catch(error => next(error))

  morgan.token('body', request => JSON.stringify(request.body))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
