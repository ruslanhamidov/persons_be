const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://ruslan:${password}@cluster0.efipttm.mongodb.net/phoneBook?appName=Cluster0`

mongoose.set('strictQuery', false)

mongoose.connect(url, {family: 4})

const personSchema = new mongoose.Schema({
  id: String,
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)

const generateId = () => {
  return Math.floor(Math.random() * 5000)
}

if (process.argv.length > 3) {

  const person = new Person({
    id: generateId(),
    name: process.argv[3],
    number: process.argv[4],
  })

  person
    .save()
    .then(result => {
      console.log(`added ${person.name} number ${person.number} to phonebook`)
      mongoose.connection.close()
    })
}
else {
  Person.find({})
    .then(result => {
      console.log('phonebook:')
      result.forEach(person => {
        console.log(`${person.name} ${person.number}`)
      })
      mongoose.connection.close()
    })
}
